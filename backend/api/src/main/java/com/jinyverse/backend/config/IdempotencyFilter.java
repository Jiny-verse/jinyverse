package com.jinyverse.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinyverse.backend.domain.idempotency.entity.IdempotencyRecord;
import com.jinyverse.backend.domain.idempotency.service.IdempotencyService;
import com.jinyverse.backend.exception.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
    private static final Set<String> SKIP_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        if (SKIP_METHODS.contains(method)) {
            return true;
        }
        String path = request.getRequestURI();
        return PATH_MATCHER.match("/api/auth/**", path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // 1. Idempotency-Key 헤더 파싱
        String idempotencyKey = request.getHeader(IDEMPOTENCY_KEY_HEADER);
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            writeError(response, HttpStatus.BAD_REQUEST, "MISSING_IDEMPOTENCY_KEY",
                    "Idempotency-Key 헤더가 필요합니다.");
            return;
        }

        // 2. UUID 형식 검증
        if (!isValidUuid(idempotencyKey)) {
            writeError(response, HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY",
                    "Idempotency-Key는 UUID v4 형식이어야 합니다.");
            return;
        }

        // 3. 요청 body 캐시 + 응답 래핑
        CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request);
        ContentCachingResponseWrapper cachedResponse = new ContentCachingResponseWrapper(response);

        // 4. body SHA-256 해시 계산
        String requestHash = sha256(cachedRequest.getCachedBody());
        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        // 5. 기존 레코드 조회 및 상태별 분기
        Optional<IdempotencyRecord> existing = idempotencyService.findByKey(idempotencyKey);

        if (existing.isPresent()) {
            IdempotencyRecord record = existing.get();

            // path 또는 hash 불일치 검증 (COMPLETED/FAILED 상태에서만 — PROCESSING은 409 우선)
            if (record.getStatus() != IdempotencyRecord.Status.PROCESSING) {
                if (!record.getRequestPath().equals(requestPath)
                        || !record.getRequestMethod().equals(requestMethod)) {
                    writeError(response, HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REUSE",
                            "동일한 Idempotency-Key를 다른 엔드포인트에 재사용할 수 없습니다.");
                    return;
                }
                if (!record.getRequestHash().equals(requestHash)) {
                    writeError(response, HttpStatus.BAD_REQUEST, "IDEMPOTENCY_REQUEST_MISMATCH",
                            "동일한 Idempotency-Key에 다른 요청 body를 사용할 수 없습니다.");
                    return;
                }
            }

            switch (record.getStatus()) {
                case PROCESSING -> {
                    writeError(response, HttpStatus.CONFLICT, "IDEMPOTENCY_PROCESSING",
                            "동일한 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.");
                    return;
                }
                case COMPLETED -> {
                    // 캐시된 응답 즉시 반환
                    response.setStatus(record.getResponseStatus());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    if (record.getResponseBody() != null) {
                        response.getWriter().write(record.getResponseBody());
                    }
                    return;
                }
                case FAILED -> {
                    // 재시도 허용: PROCESSING으로 초기화
                    idempotencyService.resetToProcessing(idempotencyKey, requestHash);
                }
            }
        } else {
            // 신규 INSERT
            try {
                idempotencyService.insertProcessing(idempotencyKey, requestPath, requestMethod, requestHash);
            } catch (DataIntegrityViolationException e) {
                // 동시 요청으로 인한 PK 충돌
                writeError(response, HttpStatus.CONFLICT, "IDEMPOTENCY_PROCESSING",
                        "동일한 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.");
                return;
            }
        }

        // 6. 실제 필터 체인 실행
        boolean success = false;
        try {
            chain.doFilter(cachedRequest, cachedResponse);
            success = true;
        } finally {
            if (success) {
                // 7a. 성공 → COMPLETED로 기록
                String responseBody = new String(cachedResponse.getContentAsByteArray(), StandardCharsets.UTF_8);
                idempotencyService.markCompleted(idempotencyKey, cachedResponse.getStatus(), responseBody);
            } else {
                // 7b. 예외 → FAILED로 기록
                idempotencyService.markFailed(idempotencyKey);
            }
            cachedResponse.copyBodyToResponse();
        }
    }

    private boolean isValidUuid(String value) {
        try {
            UUID.fromString(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String sha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
        }
    }

    private void writeError(HttpServletResponse response, HttpStatus status,
                             String code, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), new ApiErrorResponse(code, message));
    }
}
