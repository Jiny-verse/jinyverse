package com.jinyverse.backend.domain.common.util;

public enum Role {
    ADMIN,
    USER;

    public static Role fromHeader(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Role.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
