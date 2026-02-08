package com.jinyverse.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 개발용: 메일 대신 로그 출력. app.mail.use-smtp=true 이면 GmailSmtpEmailSender 사용.
 */
@Component
@ConditionalOnMissingBean(EmailSender.class)
public class LogEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LogEmailSender.class);

    @Override
    public void sendVerificationEmail(String toEmail, String code, String type) {
        log.info("[이메일 스텁] to={}, type={}, code={}", toEmail, type, code);
    }
}
