package com.jinyverse.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * POST/PUT/PATCH/DELETE 요청에 대해 Custom 헤더(X-Requested-With) 검증.
 * cross-site에서 폼 제출 등으로 보낸 요청에는 이 헤더를 붙일 수 없어 CSRF 완화.
 * 검증 제외: OPTIONS, GET 등 + /api/auth/login, refresh, logout, register, verify-email, request-password-reset, reset-password, POST /api/users
 */
public class CsrfProtectionFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-Requested-With";
    private static final String HEADER_VALUE = "XMLHttpRequest";

    private static final Set<String> STATE_CHANGING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private static final List<PathMethod> EXCLUDED = List.of(
            pathMethod("POST", "/api/auth/login"),
            pathMethod("POST", "/api/auth/refresh"),
            pathMethod("POST", "/api/auth/logout"),
            pathMethod("POST", "/api/auth/register"),
            pathMethod("POST", "/api/auth/verify-email"),
            pathMethod("POST", "/api/auth/request-password-reset"),
            pathMethod("POST", "/api/auth/reset-password"),
            pathMethod("POST", "/api/users")
    );

    private final ObjectMapper objectMapper;

    public CsrfProtectionFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private static PathMethod pathMethod(String method, String path) {
        return new PathMethod(method, path);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (path == null || !STATE_CHANGING_METHODS.contains(method.toUpperCase())) {
            return true;
        }
        for (PathMethod pm : EXCLUDED) {
            if (pm.matches(method, path)) return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String value = request.getHeader(HEADER_NAME);
        if (value == null || !HEADER_VALUE.equalsIgnoreCase(value.trim())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getOutputStream(), Map.of(
                    "error", "CSRF_VALIDATION_FAILED",
                    "message", "Missing or invalid " + HEADER_NAME + " header"
            ));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private record PathMethod(String method, String path) {
        boolean matches(String reqMethod, String reqPath) {
            return method.equalsIgnoreCase(reqMethod) && path.equals(reqPath);
        }
    }
}
