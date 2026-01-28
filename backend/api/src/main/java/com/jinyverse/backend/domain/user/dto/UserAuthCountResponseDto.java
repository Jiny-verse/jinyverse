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
public class UserAuthCountResponseDto {

    /** 인증 시도 카운트 ID */
    private UUID id;
    /** 사용자 ID */
    private UUID userId;
    /** 이메일 (비정규화) */
    private String email;
    /** 인증 시도 유형 분류 코드 */
    private String typeCategoryCode;
    /** 인증 시도 유형 코드 */
    private String type;
    /** 시도 횟수 */
    private Integer count;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 만료 일시 */
    private LocalDateTime expiredAt;
}
