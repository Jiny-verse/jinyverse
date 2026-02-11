package com.jinyverse.backend.domain.file.repository;

import com.jinyverse.backend.domain.file.entity.UploadSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UploadSessionRepository extends JpaRepository<UploadSession, UUID> {

    Optional<UploadSession> findBySessionId(String sessionId);

    void deleteByExpiresAtBefore(LocalDateTime before);
}
