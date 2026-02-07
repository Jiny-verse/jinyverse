package com.jinyverse.backend.domain.auth.controller;

import com.jinyverse.backend.domain.auth.dto.LoginRequestDto;
import com.jinyverse.backend.domain.auth.dto.LoginResponseDto;
import com.jinyverse.backend.domain.auth.dto.RefreshRequestDto;
import com.jinyverse.backend.domain.auth.service.AuthService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        LoginResponseDto response = authService.login(request, userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(@Valid @RequestBody RefreshRequestDto request) {
        LoginResponseDto response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String accessToken = authorization.substring(7);
            try {
                authService.logoutByAccessToken(accessToken);
            } catch (JwtException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }
        return ResponseEntity.noContent().build();
    }
}
