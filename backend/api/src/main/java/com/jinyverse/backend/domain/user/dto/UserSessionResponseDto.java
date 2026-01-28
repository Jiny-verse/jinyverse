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
public class UserSessionResponseDto {

    /** 세션 ID */
    private UUID id;
    /** 사용자 ID */
    private UUID userId;
    /** 브라우저/디바이스 정보 */
    private String userAgent;
    /** 접속 IP (IPv4/IPv6) */
    private String ipAddress;
    /** 강제 만료 여부 */
    private Boolean isRevoked;
    /** 생성일 */
    private LocalDateTime createdAt;
    /** 만료일 */
    private LocalDateTime expiredAt;
}
