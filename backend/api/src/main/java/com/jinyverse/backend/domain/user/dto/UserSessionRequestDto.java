package com.jinyverse.backend.domain.user.dto;

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
public class UserSessionRequestDto {

    /** 사용자 ID */
    @NotNull(message = "사용자 ID는 필수입니다")
    private UUID userId;

    /** 리프레시 토큰 */
    @NotBlank(message = "리프레시 토큰은 필수입니다")
    @Size(max = 512, message = "리프레시 토큰은 512자 이하여야 합니다")
    private String refreshToken;

    /** 브라우저/디바이스 정보 */
    @Size(max = 255, message = "사용자 에이전트는 255자 이하여야 합니다")
    private String userAgent;

    /** 접속 IP (IPv4/IPv6) */
    @Size(max = 45, message = "IP 주소는 45자 이하여야 합니다")
    private String ipAddress;

    /** 만료일 */
    @NotNull(message = "만료일시는 필수입니다")
    private LocalDateTime expiredAt;
}
