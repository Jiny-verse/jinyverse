package com.jinyverse.backend.domain.user.entity;

import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.user.dto.UserAuthCountRequestDto;
import com.jinyverse.backend.domain.user.dto.UserAuthCountResponseDto;
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
@Table(name = "user_auth_count")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAuthCount extends BaseEntity {

    /** 인증 시도 카운트 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    /** 이메일 (비정규화) */
    @Column(name = "email", length = 256, nullable = false)
    private String email;

    /** 인증 시도 유형 분류 코드 */
    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    /** 인증 시도 유형 코드 */
    @Column(name = "type", length = 40, nullable = false)
    private String type;

    /** 시도 횟수 */
    @Column(name = "count", nullable = false)
    private Integer count;

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

    public UserAuthCountRequestDto toDto() {
        return UserAuthCountRequestDto.builder()
                .userId(this.userId)
                .email(this.email)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .count(this.count)
                .expiredAt(this.expiredAt)
                .build();
    }

    public UserAuthCountResponseDto toResponseDto() {
        return UserAuthCountResponseDto.builder()
                .id(this.id)
                .userId(this.userId)
                .email(this.email)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .count(this.count)
                .createdAt(this.getCreatedAt())
                .expiredAt(this.expiredAt)
                .build();
    }
}
