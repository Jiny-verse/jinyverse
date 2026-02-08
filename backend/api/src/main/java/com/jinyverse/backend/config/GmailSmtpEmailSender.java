package com.jinyverse.backend.config;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.mail.use-smtp", havingValue = "true")
public class GmailSmtpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(GmailSmtpEmailSender.class);

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String toEmail, String code, String type) {
        if (mailSender == null) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            String subject = "email_verify".equals(type) ? "이메일 인증 코드" : "비밀번호 재설정 인증 코드";
            helper.setSubject(subject);
            helper.setText(buildBody(type, code), true);
            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}", toEmail, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildBody(String type, String code) {
        String title = "email_verify".equals(type) ? "이메일 인증" : "비밀번호 재설정";
        return String.format(
                "<p>안녕하세요.</p><p>%s를 위한 인증 코드입니다.</p><p><strong>%s</strong></p><p>5분 내에 입력해 주세요.</p>",
                title, code
        );
    }
}
