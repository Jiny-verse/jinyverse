package com.jinyverse.backend.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    private final String resource;
    private final String identifier;

    public ResourceNotFoundException(String resource, UUID id) {
        super(resource + " not found: " + id);
        this.resource = resource;
        this.identifier = id != null ? id.toString() : null;
    }

    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " not found: " + identifier);
        this.resource = resource;
        this.identifier = identifier;
    }

    public String getCode() {
        return "NOT_FOUND";
    }

    public String getResource() {
        return resource;
    }

    public String getIdentifier() {
        return identifier;
    }
}
