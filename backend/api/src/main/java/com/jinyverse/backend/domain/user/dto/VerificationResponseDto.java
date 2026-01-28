package com.jinyverse.backend.domain.user.dto;

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
public class VerificationResponseDto {

    /** 인증 정보 ID */
    private UUID id;
    /** 사용자 ID */
    private UUID userId;
    /** 세션 ID */
    private UUID sessionId;
    /** 인증 유형 분류 코드 */
    private String typeCategoryCode;
    /** 인증 유형 코드 */
    private String type;
    /** 인증 대상 이메일 */
    private String email;
    /** 인증 완료 여부 */
    private Boolean isVerified;
    /** 인증 메일 발송 여부 */
    private Boolean isSent;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 만료 일시 */
    private LocalDateTime expiredAt;
}
