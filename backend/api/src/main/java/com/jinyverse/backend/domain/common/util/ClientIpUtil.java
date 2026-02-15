package com.jinyverse.backend.domain.common.util;

import jakarta.servlet.http.HttpServletRequest;

public final class ClientIpUtil {
    private ClientIpUtil() {}

    public static String extractIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
