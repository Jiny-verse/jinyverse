package com.jinyverse.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.ClientIpUtil;
import com.jinyverse.backend.domain.common.util.JwtUtil;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import com.jinyverse.backend.domain.common.util.Role;
import com.jinyverse.backend.exception.ApiErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * /api/** 요청에 대해 JWT 검증. 토큰은 쿠키(access_token) 우선, 없으면 Authorization Bearer.
 * 인증 제외: POST /api/auth/login, refresh, logout, register, verify-email, request-password-reset, reset-password / POST /api/users
 * 만료 시 401 TOKEN_EXPIRED, 서명/형식 오류 시 401 INVALID_TOKEN. 유효 시 RequestContext 설정 후 chain 진행, finally에서 clear.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER = "Bearer ";

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        if (path == null) {
            return false;
        }
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        if ("POST".equalsIgnoreCase(method) && "/api/users".equals(path)) {
            return true;
        }
        if (!path.startsWith("/api/auth/")) {
            return false;
        }
        return "POST".equalsIgnoreCase(method)
                && (path.equals("/api/auth/login") || path.equals("/api/auth/refresh") || path.equals("/api/auth/logout")
                || path.equals("/api/auth/register") || path.equals("/api/auth/verify-email")
                || path.equals("/api/auth/request-password-reset") || path.equals("/api/auth/reset-password"));
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String token = extractAccessToken(request);
            if (token != null && !token.isBlank()) {
                RequestContext existing = RequestContextHolder.get();
                UUID userId = jwtUtil.getUserIdFromToken(token);
                String roleStr = jwtUtil.getRoleFromToken(token);
                String username = jwtUtil.getUsernameFromToken(token);
                RequestContext auth = existing != null
                        ? existing.withAuth(userId, username, Role.fromHeader(roleStr))
                        : RequestContext.anonymous(Channel.INTERNAL, ClientIpUtil.extractIp(request))
                                        .withAuth(userId, username, Role.fromHeader(roleStr));
                RequestContextHolder.set(auth);
                filterChain.doFilter(request, response);
            } else {
                if (isPublicGetRequest(request)) {
                    filterChain.doFilter(request, response);
                } else {
                    sendError(response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Missing or invalid access token (cookie or Authorization header)");
                }
            }
        } catch (ExpiredJwtException e) {
            sendError(response, HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED", "Access token has expired");
        } catch (JwtException e) {
            sendError(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Invalid or malformed token");
        }
    }

    private boolean isPublicGetRequest(HttpServletRequest request) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String path = request.getRequestURI();
        if (path == null) return false;
        if (path.equals("/api/menus") || path.startsWith("/api/menus/")) return true;
        if (path.equals("/api/boards")) return true;
        if (path.equals("/api/topics")) return true;
        if (path.startsWith("/api/topics/") && path.indexOf('/', 12) < 0) return true; // /api/topics/{id} 단건만
        if (path.equals("/api/comments")) return true;
        return false;
    }

    private String extractAccessToken(HttpServletRequest request) {
        return CookieUtil.getCookieValue(request, CookieUtil.COOKIE_ACCESS_TOKEN)
                .orElseGet(() -> extractBearerToken(request));
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            return null;
        }
        return header.substring(BEARER.length()).trim();
    }

    private void sendError(HttpServletResponse response, HttpStatus status, String code, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), new ApiErrorResponse(code, message));
    }
}
