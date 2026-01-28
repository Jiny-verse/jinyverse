package com.jinyverse.backend.domain.common.util;

public enum Channel {
    INTERNAL,
    EXTERNAL;

    public static Channel fromHeader(String raw) {
        if (raw == null || raw.isBlank()) {
            return INTERNAL;
        }
        return Channel.valueOf(raw.trim().toUpperCase());
    }
}
