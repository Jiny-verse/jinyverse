package com.jinyverse.backend.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {

    private UUID userId;
    private String username;
    private String role;
    private String accessToken;
    private String refreshToken;
    private Instant expiresAt;
}