package com.jinyverse.backend.exception;

public class ConflictException extends RuntimeException {

    private final String code;

    public ConflictException(String code, String message) {
        super(message);
        this.code = code != null ? code : "CONFLICT";
    }

    public ConflictException(String message) {
        this("CONFLICT", message);
    }

    public String getCode() {
        return code;
    }
}
