package com.jinyverse.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinyverse.backend.domain.common.util.JwtUtil;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

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
            if (token == null || token.isBlank()) {
                sendUnauthorized(response, "UNAUTHORIZED", "Missing or invalid access token (cookie or Authorization header)");
                return;
            }
            RequestContext context = RequestContext.fromToken(jwtUtil, token);
            RequestContextHolder.set(context);
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            sendUnauthorized(response, "TOKEN_EXPIRED", "Access token has expired");
        } catch (JwtException e) {
            sendUnauthorized(response, "INVALID_TOKEN", "Invalid or malformed token");
        } finally {
            RequestContextHolder.clear();
        }
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

    private void sendUnauthorized(HttpServletResponse response, String error, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), Map.of(
                "error", error,
                "message", message
        ));
    }
}
