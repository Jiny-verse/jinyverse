package com.jinyverse.backend.exception;

public class BadRequestException extends RuntimeException {

    private final String code;

    public BadRequestException(String code, String message) {
        super(message);
        this.code = code != null ? code : "BAD_REQUEST";
    }

    public BadRequestException(String message) {
        this("BAD_REQUEST", message);
    }

    public String getCode() {
        return code;
    }
}
