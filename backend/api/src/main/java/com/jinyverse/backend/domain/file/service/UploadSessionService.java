package com.jinyverse.backend.domain.file.service;

import com.jinyverse.backend.domain.file.dto.UploadSessionResponseDto;
import com.jinyverse.backend.domain.file.entity.UploadSession;
import com.jinyverse.backend.domain.file.repository.UploadSessionRepository;
import com.jinyverse.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UploadSessionService {

    private final UploadSessionRepository uploadSessionRepository;

    @Value("${app.upload-session.ttl-minutes:60}")
    private int ttlMinutes;

    @Transactional
    public UploadSessionResponseDto issue(UUID userId) {
        String sessionId = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(ttlMinutes);
        UploadSession entity = UploadSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .expiresAt(expiresAt)
                .build();
        uploadSessionRepository.save(entity);
        return UploadSessionResponseDto.builder()
                .sessionId(sessionId)
                .expiresAt(expiresAt)
                .build();
    }

    public void validate(String sessionId, UUID userId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        UploadSession session = uploadSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new BadRequestException("UPLOAD_SESSION_INVALID", "유효하지 않은 업로드 세션입니다."));
        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            throw new BadRequestException("UPLOAD_SESSION_EXPIRED", "업로드 세션이 만료되었습니다.");
        }
        if (!session.getUserId().equals(userId)) {
            throw new BadRequestException("UPLOAD_SESSION_FORBIDDEN", "해당 업로드 세션을 사용할 수 없습니다.");
        }
    }
}
