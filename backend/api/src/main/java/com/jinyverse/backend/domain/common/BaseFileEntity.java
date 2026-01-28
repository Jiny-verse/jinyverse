package com.jinyverse.backend.domain.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseFileEntity {

    /** 임시 업로드 세션 ID */
    @Column(name = "session_id", length = 64)
    private String sessionId;

    /** 원본 파일명 */
    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    /** 서버 저장 파일명 */
    @Column(name = "stored_name", nullable = false, length = 255)
    private String storedName;

    /** 파일 저장 경로 */
    @Column(name = "file_path", nullable = false, columnDefinition = "TEXT")
    private String filePath;

    /** 파일 크기 (byte) */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /** 파일 MIME 타입 */
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    /** 파일 확장자 */
    @Column(name = "file_ext", length = 20)
    private String fileExt;

    /** 생성일시 */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
