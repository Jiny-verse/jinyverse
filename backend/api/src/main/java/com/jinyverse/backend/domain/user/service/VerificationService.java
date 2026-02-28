package com.jinyverse.backend.domain.user.service;

import com.jinyverse.backend.config.EmailSender;
import com.jinyverse.backend.domain.user.entity.Verification;
import com.jinyverse.backend.domain.user.repository.VerificationRepository;
import com.jinyverse.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final String TYPE_CATEGORY = "verification_type";
    private static final String TYPE_EMAIL_VERIFY = "email_verify";
    private static final String TYPE_PASSWORD_RESET = "password_reset";
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 5;

    private final VerificationRepository verificationRepository;
    private final EmailSender emailSender;

    @Transactional
    public String requestVerification(String email, String type, UUID userId) {
        if (!TYPE_EMAIL_VERIFY.equals(type) && !TYPE_PASSWORD_RESET.equals(type)) {
            throw new BadRequestException("Invalid verification type");
        }
        String code = generateCode();
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(EXPIRY_MINUTES);
        Verification verification = Verification.builder()
                .userId(userId)
                .typeCategoryCode(TYPE_CATEGORY)
                .type(type)
                .email(email)
                .code(code)
                .isVerified(false)
                .isSent(false)
                .expiredAt(expiredAt)
                .build();
        verificationRepository.save(verification);
        emailSender.sendVerificationEmail(email, code, type);
        verification.setIsSent(true);
        verificationRepository.save(verification);
        return code;
    }

    @Transactional
    public Verification verify(String email, String code, String type) {
        Verification v = verificationRepository
                .findByEmailAndTypeAndCodeAndDeletedAtIsNull(email, type, code)
                .orElseThrow(() -> new BadRequestException("Invalid or expired code"));
        if (Boolean.TRUE.equals(v.getIsVerified())) {
            throw new BadRequestException("Already verified");
        }
        if (v.getExpiredAt() != null && LocalDateTime.now().isAfter(v.getExpiredAt())) {
            throw new BadRequestException("Code expired");
        }
        v.setIsVerified(true);
        verificationRepository.save(v);
        return v;
    }

    private static String generateCode() {
        SecureRandom random = new SecureRandom();
        String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
