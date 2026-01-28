package com.jinyverse.backend.domain.user.entity;

import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.user.dto.VerificationRequestDto;
import com.jinyverse.backend.domain.user.dto.VerificationResponseDto;
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
@Table(name = "verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification extends BaseEntity {

    /** 인증 정보 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    /** 세션 ID */
    @Column(name = "session_id", columnDefinition = "UUID")
    private UUID sessionId;

    /** 인증 유형 분류 코드 */
    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    /** 인증 유형 코드 */
    @Column(name = "type", length = 40, nullable = false)
    private String type;

    /** 인증 대상 이메일 */
    @Column(name = "email", length = 256, nullable = false)
    private String email;

    /** 인증 코드 */
    @Column(name = "code", length = 50, nullable = false)
    private String code;

    /** 인증 완료 여부 */
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified;

    /** 인증 메일 발송 여부 */
    @Column(name = "is_sent", nullable = false)
    private Boolean isSent;

    /** 만료 일시 */
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_category_code", insertable = false, updatable = false)
    private CodeCategory typeCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "type_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "type", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code typeCode;

    public VerificationRequestDto toDto() {
        return VerificationRequestDto.builder()
                .userId(this.userId)
                .sessionId(this.sessionId)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .email(this.email)
                .code(this.code)
                .expiredAt(this.expiredAt)
                .build();
    }

    public VerificationResponseDto toResponseDto() {
        return VerificationResponseDto.builder()
                .id(this.id)
                .userId(this.userId)
                .sessionId(this.sessionId)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .email(this.email)
                .isVerified(this.isVerified)
                .isSent(this.isSent)
                .createdAt(this.getCreatedAt())
                .expiredAt(this.expiredAt)
                .build();
    }
}
