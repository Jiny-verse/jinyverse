package com.jinyverse.backend.domain.auth.controller;

import com.jinyverse.backend.config.CookieUtil;
import com.jinyverse.backend.domain.auth.dto.LoginRequestDto;
import com.jinyverse.backend.domain.auth.dto.LoginResponseDto;
import com.jinyverse.backend.domain.auth.dto.RegisterRequestDto;
import com.jinyverse.backend.domain.auth.dto.RequestPasswordResetDto;
import com.jinyverse.backend.domain.auth.dto.ResetPasswordRequestDto;
import com.jinyverse.backend.domain.auth.dto.VerifyEmailRequestDto;
import com.jinyverse.backend.domain.auth.service.AuthService;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final int ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 60;
    private static final int REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        LoginResponseDto response = authService.login(request, userAgent);
        CookieUtil.addCookie(httpResponse, CookieUtil.COOKIE_ACCESS_TOKEN, response.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS, httpRequest);
        CookieUtil.addCookie(httpResponse, CookieUtil.COOKIE_REFRESH_TOKEN, response.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS, httpRequest);
        return ResponseEntity.ok(responseWithoutTokens(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String refreshToken = CookieUtil.getCookieValue(httpRequest, CookieUtil.COOKIE_REFRESH_TOKEN)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token"));
        LoginResponseDto response = authService.refresh(refreshToken);
        CookieUtil.addCookie(httpResponse, CookieUtil.COOKIE_ACCESS_TOKEN, response.getAccessToken(), ACCESS_COOKIE_MAX_AGE_SECONDS, httpRequest);
        CookieUtil.addCookie(httpResponse, CookieUtil.COOKIE_REFRESH_TOKEN, response.getRefreshToken(), REFRESH_COOKIE_MAX_AGE_SECONDS, httpRequest);
        return ResponseEntity.ok(responseWithoutTokens(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Optional<String> accessToken = CookieUtil.getCookieValue(httpRequest, CookieUtil.COOKIE_ACCESS_TOKEN);
        accessToken.ifPresent(token -> {
            try {
                authService.logoutByAccessToken(token);
            } catch (JwtException ignored) {
            }
        });
        CookieUtil.clearCookie(httpResponse, CookieUtil.COOKIE_ACCESS_TOKEN);
        CookieUtil.clearCookie(httpResponse, CookieUtil.COOKIE_REFRESH_TOKEN);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponseDto> me() {
        var ctx = RequestContextHolder.get();
        if (ctx == null || !ctx.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(LoginResponseDto.builder()
                .userId(ctx.getUserId())
                .username(ctx.getUsername())
                .role(ctx.getRole() != null ? ctx.getRole().name().toLowerCase() : null)
                .build());
    }

    private static LoginResponseDto responseWithoutTokens(LoginResponseDto full) {
        return LoginResponseDto.builder()
                .userId(full.getUserId())
                .username(full.getUsername())
                .role(full.getRole())
                .expiresAt(full.getExpiresAt())
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequestDto request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequestDto request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<Void> requestPasswordReset(@Valid @RequestBody RequestPasswordResetDto request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
