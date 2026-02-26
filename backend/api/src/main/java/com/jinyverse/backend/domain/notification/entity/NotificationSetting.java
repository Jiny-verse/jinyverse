package com.jinyverse.backend.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "notification_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false, unique = true)
    private UUID userId;

    /** 시스템 알림 수신 여부 */
    @Builder.Default
    @Column(name = "system_enabled", nullable = false)
    private Boolean systemEnabled = true;

    /** 이메일 알림 수신 여부 */
    @Builder.Default
    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = false;

    /** 이메일 수신 주소 오버라이드 (null이면 user.email 사용) */
    @Column(name = "email_override", length = 255)
    private String emailOverride;

    /** 타입별 세부 설정 {"comment": true, "reply": false, ...} */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "type_settings", columnDefinition = "jsonb")
    private Map<String, Boolean> typeSettings;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
