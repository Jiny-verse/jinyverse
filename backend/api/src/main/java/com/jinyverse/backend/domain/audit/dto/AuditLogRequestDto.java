package com.jinyverse.backend.domain.audit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogRequestDto {

    /** 대상 타입 (USER, TOPIC, CODE 등) */
    @NotBlank(message = "대상 타입은 필수입니다")
    @Size(max = 40, message = "대상 타입은 40자 이하여야 합니다")
    private String targetType;

    /** 대상 ID (nullable 허용) */
    private UUID targetId;

    /** 행위 유형 (CREATE, UPDATE, DELETE) */
    @NotBlank(message = "행위는 필수입니다")
    @Size(max = 40, message = "행위는 40자 이하여야 합니다")
    private String action;

    /** 변경 전 데이터 */
    private String beforeData;

    /** 변경 후 데이터 */
    private String afterData;

    /** 행위자 사용자 ID */
    private UUID actorUserId;

    /** 요청 IP */
    @Size(max = 45, message = "IP 주소는 45자 이하여야 합니다")
    private String ipAddress;
}
