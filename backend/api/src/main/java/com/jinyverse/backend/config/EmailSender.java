package com.jinyverse.backend.config;

/**
 * 인증 메일 발송 (이메일 인증, 비밀번호 재설정 등).
 */
public interface EmailSender {

    void sendVerificationEmail(String toEmail, String code, String type);
}
