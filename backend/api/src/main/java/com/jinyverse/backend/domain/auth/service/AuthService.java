package com.jinyverse.backend.domain.auth.service;

import com.jinyverse.backend.domain.auth.dto.LoginRequestDto;
import com.jinyverse.backend.domain.auth.dto.LoginResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import com.jinyverse.backend.domain.user.entity.UserAuthCount;
import com.jinyverse.backend.domain.user.entity.UserSession;
import com.jinyverse.backend.domain.user.repository.UserAuthCountRepository;
import com.jinyverse.backend.domain.user.repository.UserRepository;
import com.jinyverse.backend.domain.user.repository.UserSessionRepository;
import com.jinyverse.backend.domain.common.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String USER_AUTH_COUNT_TYPE_CATEGORY = "user_auth_count_type";
    private static final String LOGIN_ATTEMPT_TYPE = "login_attempt";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_WINDOW_MINUTES = 15;
    private static final int REFRESH_TOKEN_BYTES = 64;

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserAuthCountRepository userAuthCountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PlatformTransactionManager transactionManager;

    private String dummyBcryptHash;

    @PostConstruct
    void init() {
        dummyBcryptHash = passwordEncoder.encode("dummy");
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto request, String userAgent, String ipAddress) {
        Optional<User> userOpt = userRepository.findByUsernameAndDeletedAtIsNull(request.getUsername());

        if (userOpt.isEmpty()) {
            passwordEncoder.matches(request.getPassword(), dummyBcryptHash);
            recordLoginFailureInNewTx(request.getUsername(), null);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = userOpt.get();
        if (Boolean.TRUE.equals(user.getIsLocked())) {
            boolean unlocked = tryUnlockAfterLockoutWindow(user);
            if (!unlocked) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account locked");
            }
        }
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account disabled");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            recordLoginFailureInNewTx(request.getUsername(), user);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        resetLoginFailCount(user);

        String refreshToken = generateRefreshToken();
        LocalDateTime expiredAt = LocalDateTime.now().plusDays(7);

        UserSession session = UserSession.builder()
                .userId(user.getId())
                .refreshToken(refreshToken)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .isRevoked(false)
                .expiredAt(expiredAt)
                .build();
        userSessionRepository.save(session);

        Duration accessExpiry = Duration.ofMinutes(30);
        String accessToken = jwtUtil.createAccessToken(user.getId(), user.getRole(), user.getUsername(), accessExpiry);
        Instant expiresAt = Instant.now().plus(accessExpiry);

        return LoginResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresAt(expiresAt)
                .build();
    }

    /**
     * 별도 트랜잭션에서 실행해 401 예외로 롤백되어도 실패 기록이 커밋되도록 함.
     */
    private void recordLoginFailureInNewTx(String username, User user) {
        TransactionDefinition def = new DefaultTransactionDefinition(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = transactionManager.getTransaction(def);
        try {
            handleLoginFailure(username, user);
            transactionManager.commit(status);
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }

    private void handleLoginFailure(String username, User user) {
        String email = user != null ? user.getEmail() : (username + "@login.attempt");
        UserAuthCount countEntity = userAuthCountRepository
                .findByEmailAndTypeCategoryCodeAndTypeAndDeletedAtIsNull(
                        email, USER_AUTH_COUNT_TYPE_CATEGORY, LOGIN_ATTEMPT_TYPE
                )
                .orElseGet(() -> UserAuthCount.builder()
                        .userId(user != null ? user.getId() : null)
                        .email(email)
                        .typeCategoryCode(USER_AUTH_COUNT_TYPE_CATEGORY)
                        .type(LOGIN_ATTEMPT_TYPE)
                        .count(0)
                        .build());

        LocalDateTime windowEnd = LocalDateTime.now().plusMinutes(LOCKOUT_WINDOW_MINUTES);
        if (countEntity.getExpiredAt() != null && LocalDateTime.now().isAfter(countEntity.getExpiredAt())) {
            countEntity.setCount(0);
        }
        countEntity.setCount(countEntity.getCount() + 1);
        countEntity.setExpiredAt(windowEnd);
        userAuthCountRepository.save(countEntity);

        if (countEntity.getCount() >= MAX_LOGIN_ATTEMPTS && user != null) {
            user.setIsLocked(true);
            userRepository.save(user);
        }
    }

    /**
     * 잠금 후 15분(실패 윈도우)이 지났으면 잠금 해제하고 true 반환. 아니면 false.
     */
    private boolean tryUnlockAfterLockoutWindow(User user) {
        return userAuthCountRepository
                .findByEmailAndTypeCategoryCodeAndTypeAndDeletedAtIsNull(
                        user.getEmail(), USER_AUTH_COUNT_TYPE_CATEGORY, LOGIN_ATTEMPT_TYPE
                )
                .filter(entity -> entity.getExpiredAt() != null
                        && LocalDateTime.now().isAfter(entity.getExpiredAt()))
                .map(entity -> {
                    user.setIsLocked(false);
                    userRepository.save(user);
                    resetLoginFailCount(user);
                    return true;
                })
                .orElse(false);
    }

    private void resetLoginFailCount(User user) {
        userAuthCountRepository
                .findByEmailAndTypeCategoryCodeAndTypeAndDeletedAtIsNull(
                        user.getEmail(), USER_AUTH_COUNT_TYPE_CATEGORY, LOGIN_ATTEMPT_TYPE
                )
                .ifPresent(entity -> {
                    entity.setCount(0);
                    entity.setExpiredAt(null);
                    userAuthCountRepository.save(entity);
                });
    }

    private static String generateRefreshToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[REFRESH_TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional(readOnly = true)
    public LoginResponseDto refresh(String refreshToken) {
        UserSession session = userSessionRepository.findByRefreshTokenAndDeletedAtIsNull(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (Boolean.TRUE.equals(session.getIsRevoked()) || LocalDateTime.now().isAfter(session.getExpiredAt())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (Boolean.TRUE.equals(user.getIsLocked()) || Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account locked or disabled");
        }

        Duration accessExpiry = Duration.ofMinutes(30);
        String accessToken = jwtUtil.createAccessToken(user.getId(), user.getRole(), user.getUsername(), accessExpiry);
        Instant expiresAt = Instant.now().plus(accessExpiry);

        return LoginResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresAt(expiresAt)
                .build();
    }

    @Transactional
    public void logoutByAccessToken(String accessToken) {
        UUID userId = jwtUtil.getUserIdFromToken(accessToken);
        List<UserSession> sessions = userSessionRepository.findByUserIdAndDeletedAtIsNull(userId);
        sessions.forEach(s -> s.setIsRevoked(true));
        userSessionRepository.saveAll(sessions);
    }
}
