package com.jinyverse.backend.domain.audit.entity;

import com.jinyverse.backend.domain.audit.dto.AuditLogRequestDto;
import com.jinyverse.backend.domain.audit.dto.AuditLogResponseDto;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    /** 감사 로그 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 대상 타입 (USER, TOPIC, CODE 등) */
    @Column(name = "target_type", length = 40, nullable = false)
    private String targetType;

    /** 대상 ID (nullable 허용) */
    @Column(name = "target_id", columnDefinition = "UUID")
    private UUID targetId;

    /** 행위 유형 (CREATE, UPDATE, DELETE) */
    @Column(name = "action", length = 40, nullable = false)
    private String action;

    /** 변경 전 데이터 */
    @Column(name = "before_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String beforeData;

    /** 변경 후 데이터 */
    @Column(name = "after_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String afterData;

    /** 행위자 사용자 ID */
    @Column(name = "actor_user_id", columnDefinition = "UUID")
    private UUID actorUserId;

    /** 요청 IP */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id", insertable = false, updatable = false)
    private User actor;

    public static AuditLog fromRequestDto(AuditLogRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("AuditLogRequestDto is null");
        return AuditLog.builder()
                .targetType(dto.getTargetType())
                .targetId(dto.getTargetId())
                .action(dto.getAction())
                .beforeData(dto.getBeforeData())
                .afterData(dto.getAfterData())
                .actorUserId(dto.getActorUserId())
                .ipAddress(dto.getIpAddress())
                .build();
    }

    public AuditLogRequestDto toDto() {
        return AuditLogRequestDto.builder()
                .targetType(this.targetType)
                .targetId(this.targetId)
                .action(this.action)
                .beforeData(this.beforeData)
                .afterData(this.afterData)
                .actorUserId(this.actorUserId)
                .ipAddress(this.ipAddress)
                .build();
    }

    public AuditLogResponseDto toResponseDto() {
        return AuditLogResponseDto.builder()
                .id(this.id)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .action(this.action)
                .beforeData(this.beforeData)
                .afterData(this.afterData)
                .actorUserId(this.actorUserId)
                .ipAddress(this.ipAddress)
                .createdAt(this.getCreatedAt())
                .build();
    }
}
