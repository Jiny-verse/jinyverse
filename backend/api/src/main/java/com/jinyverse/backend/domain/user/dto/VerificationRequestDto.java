package com.jinyverse.backend.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class VerificationRequestDto {

    /** 사용자 ID */
    private UUID userId;

    /** 세션 ID */
    private UUID sessionId;

    /** 인증 유형 분류 코드 */
    @NotBlank(message = "타입 분류 코드는 필수입니다")
    @Size(max = 40, message = "타입 분류 코드는 40자 이하여야 합니다")
    private String typeCategoryCode;

    /** 인증 유형 코드 */
    @NotBlank(message = "타입은 필수입니다")
    @Size(max = 40, message = "타입은 40자 이하여야 합니다")
    private String type;

    /** 인증 대상 이메일 */
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 256, message = "이메일은 256자 이하여야 합니다")
    private String email;

    /** 인증 코드 */
    @NotBlank(message = "인증 코드는 필수입니다")
    @Size(max = 50, message = "인증 코드는 50자 이하여야 합니다")
    private String code;

    /** 만료 일시 */
    private LocalDateTime expiredAt;
}
