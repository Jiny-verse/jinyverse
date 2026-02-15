package com.jinyverse.backend.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDto {

    /** 감사 로그 ID */
    private UUID id;
    /** 대상 타입 (USER, TOPIC, CODE 등) */
    private String targetType;
    /** 대상 ID (nullable 허용) */
    private UUID targetId;
    /** 행위 유형 (CREATE, UPDATE, DELETE) */
    private String action;
    /** 변경 전 데이터 */
    private String beforeData;
    /** 변경 후 데이터 */
    private String afterData;
    /** 행위자 사용자 ID */
    private UUID actorUserId;
    /** 요청 IP */
    private String ipAddress;
    /** 추가 식별 메타데이터 */
    private String metadata;
    /** 행위 시점 */
    private LocalDateTime createdAt;
}
