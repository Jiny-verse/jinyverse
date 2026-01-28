package com.jinyverse.backend.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class UserAuthCountRequestDto {

    /** 사용자 ID */
    private UUID userId;

    /** 이메일 (비정규화) */
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 256, message = "이메일은 256자 이하여야 합니다")
    private String email;

    /** 인증 시도 유형 분류 코드 */
    @NotBlank(message = "타입 분류 코드는 필수입니다")
    @Size(max = 40, message = "타입 분류 코드는 40자 이하여야 합니다")
    private String typeCategoryCode;

    /** 인증 시도 유형 코드 */
    @NotBlank(message = "타입은 필수입니다")
    @Size(max = 40, message = "타입은 40자 이하여야 합니다")
    private String type;

    /** 시도 횟수 */
    @NotNull(message = "카운트는 필수입니다")
    private Integer count;

    /** 만료 일시 */
    private LocalDateTime expiredAt;
}
