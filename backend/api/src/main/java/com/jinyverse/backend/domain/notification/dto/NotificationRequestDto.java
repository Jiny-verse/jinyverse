package com.jinyverse.backend.domain.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class NotificationRequestDto {

    /** 수신 사용자 ID */
    @NotNull(message = "사용자 ID는 필수입니다")
    private UUID userId;

    /** 알림 타입 분류 */
    @NotBlank(message = "타입 분류 코드는 필수입니다")
    @Size(max = 40, message = "타입 분류 코드는 40자 이하여야 합니다")
    private String typeCategoryCode;

    /** 알림 타입 코드 (COMMENT, REPLY, SYSTEM 등) */
    @NotBlank(message = "타입은 필수입니다")
    @Size(max = 40, message = "타입은 40자 이하여야 합니다")
    private String type;

    /** 알림 메시지 */
    @NotBlank(message = "메시지는 필수입니다")
    private String message;

    /** 이동 링크 */
    private String link;
}
