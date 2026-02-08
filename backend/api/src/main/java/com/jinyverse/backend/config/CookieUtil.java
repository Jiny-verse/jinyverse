package com.jinyverse.backend.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Optional;

/**
 * httpOnly 쿠키 설정/제거 유틸. access_token, refresh_token 저장 시 XSS로 탈취 방지.
 */
public final class CookieUtil {

    public static final String COOKIE_ACCESS_TOKEN = "access_token";
    public static final String COOKIE_REFRESH_TOKEN = "refresh_token";

    private static final String PATH = "/";
    private static final String SAME_SITE_LAX = "Lax";

    private CookieUtil() {
    }

    /**
     * httpOnly 쿠키 추가. Secure는 HTTPS 요청일 때만 true.
     */
    public static void addCookie(
            HttpServletResponse response,
            String name,
            String value,
            int maxAgeSeconds,
            HttpServletRequest request
    ) {
        boolean secure = request != null && request.isSecure();
        String cookie = buildSetCookieHeader(name, value, maxAgeSeconds, secure);
        response.addHeader("Set-Cookie", cookie);
    }

    public static void clearCookie(HttpServletResponse response, String name) {
        String cookie = name + "=; Path=" + PATH + "; Max-Age=0; HttpOnly; SameSite=" + SAME_SITE_LAX;
        response.addHeader("Set-Cookie", cookie);
    }

    public static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                String v = c.getValue();
                return Optional.ofNullable(v != null && !v.isBlank() ? v : null);
            }
        }
        return Optional.empty();
    }

    private static String buildSetCookieHeader(String name, String value, int maxAgeSeconds, boolean secure) {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append("=").append(value == null ? "" : value)
                .append("; Path=").append(PATH)
                .append("; Max-Age=").append(maxAgeSeconds)
                .append("; HttpOnly")
                .append("; SameSite=").append(SAME_SITE_LAX);
        if (secure) {
            sb.append("; Secure");
        }
        return sb.toString();
    }
}
