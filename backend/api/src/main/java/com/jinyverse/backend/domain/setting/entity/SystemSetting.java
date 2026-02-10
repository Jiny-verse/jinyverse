package com.jinyverse.backend.domain.setting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** 관리단에서 설정하는 키-값. (파일 저장 경로 등) */
@Entity
@Table(name = "system_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting {

    /** 설정 키 (예: file.storage.basePath) */
    @Id
    @Column(name = "key", length = 120, nullable = false)
    private String key;

    /** 설정 값 */
    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    /** 마지막 수정일시 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
