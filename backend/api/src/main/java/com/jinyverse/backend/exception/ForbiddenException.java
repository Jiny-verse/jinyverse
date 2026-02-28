package com.jinyverse.backend.exception;

public class ForbiddenException extends RuntimeException {

    private final String code;

    public ForbiddenException(String code, String message) {
        super(message);
        this.code = code != null ? code : "FORBIDDEN";
    }

    public ForbiddenException(String message) {
        this("FORBIDDEN", message);
    }

    public String getCode() {
        return code;
    }
}
