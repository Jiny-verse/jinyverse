package com.jinyverse.backend.domain.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final int MIN_SECRET_LENGTH = 32;
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_USERNAME = "username";

    private final SecretKey secretKey;
    private final int accessExpireMinutes;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expire-minutes:30}") int accessExpireMinutes
    ) {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least " + MIN_SECRET_LENGTH + " characters (app.jwt.secret)"
            );
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpireMinutes = accessExpireMinutes;
    }

    public String createAccessToken(UUID userId, String role, String username, Duration expiry) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiry)))
                .signWith(secretKey);
        if (username != null && !username.isBlank()) {
            builder.claim(CLAIM_USERNAME, username);
        }
        return builder.compact();
    }

    public String createAccessToken(UUID userId, String role, Duration expiry) {
        return createAccessToken(userId, role, null, expiry);
    }

    public String createAccessToken(UUID userId, String role) {
        return createAccessToken(userId, role, null, Duration.ofMinutes(accessExpireMinutes));
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw e;
        } catch (JwtException e) {
            throw new JwtException("Invalid token", e);
        }
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        Object role = claims.get(CLAIM_ROLE);
        return role != null ? role.toString() : null;
    }

    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        Object username = claims.get(CLAIM_USERNAME);
        return username != null ? username.toString() : null;
    }
}
