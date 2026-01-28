package com.jinyverse.backend.domain.user.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.user.dto.UserSessionRequestDto;
import com.jinyverse.backend.domain.user.dto.UserSessionResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession extends BaseEntity {

    /** 세션 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    private UUID userId;

    /** 리프레시 토큰 */
    @Column(name = "refresh_token", length = 512, nullable = false)
    private String refreshToken;

    /** 브라우저/디바이스 정보 */
    @Column(name = "user_agent", length = 255)
    private String userAgent;

    /** 접속 IP (IPv4/IPv6) */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /** 강제 만료 여부 */
    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked;

    /** 만료일 */
    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    public UserSessionRequestDto toDto() {
        return UserSessionRequestDto.builder()
                .userId(this.userId)
                .refreshToken(this.refreshToken)
                .userAgent(this.userAgent)
                .ipAddress(this.ipAddress)
                .expiredAt(this.expiredAt)
                .build();
    }

    public UserSessionResponseDto toResponseDto() {
        return UserSessionResponseDto.builder()
                .id(this.id)
                .userId(this.userId)
                .userAgent(this.userAgent)
                .ipAddress(this.ipAddress)
                .isRevoked(this.isRevoked)
                .createdAt(this.getCreatedAt())
                .expiredAt(this.expiredAt)
                .build();
    }
}
