package com.jinyverse.backend.domain.landing.entity;

import com.jinyverse.backend.domain.landing.dto.LandingCtaRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingCtaResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "landing_cta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert
@DynamicUpdate
@EntityListeners(AuditingEntityListener.class)
public class LandingCta {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    @Column(name = "section_id", columnDefinition = "UUID", nullable = false)
    private UUID sectionId;

    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    @Column(name = "type", length = 40, nullable = false)
    private String type;

    @Column(name = "label", length = 255)
    private String label;

    @Column(name = "href", length = 1000, nullable = false)
    private String href;

    @Column(name = "class_name", columnDefinition = "TEXT")
    private String className;

    @Column(name = "position_top", precision = 6, scale = 2)
    private BigDecimal positionTop;

    @Column(name = "position_left", precision = 6, scale = 2)
    private BigDecimal positionLeft;

    @Column(name = "position_bottom", precision = 6, scale = 2)
    private BigDecimal positionBottom;

    @Column(name = "position_right", precision = 6, scale = 2)
    private BigDecimal positionRight;

    @Column(name = "position_transform", length = 255)
    private String positionTransform;

    @Column(name = "image_file_id", columnDefinition = "UUID")
    private UUID imageFileId;

    @Column(name = "order", nullable = false)
    private Integer order;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", insertable = false, updatable = false)
    private LandingSection section;

    public static LandingCta fromRequestDto(UUID sectionId, LandingCtaRequestDto dto) {
        return LandingCta.builder()
                .sectionId(sectionId)
                .typeCategoryCode("landing_cta_type")
                .type(dto.getType() != null ? dto.getType() : "button")
                .label(dto.getLabel())
                .href(dto.getHref())
                .className(dto.getClassName())
                .positionTop(dto.getPositionTop())
                .positionLeft(dto.getPositionLeft())
                .positionBottom(dto.getPositionBottom())
                .positionRight(dto.getPositionRight())
                .positionTransform(dto.getPositionTransform())
                .imageFileId(dto.getImageFileId())
                .order(dto.getOrder() != null ? dto.getOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    public void applyUpdate(LandingCtaRequestDto dto) {
        if (dto.getType() != null) this.type = dto.getType();
        if (dto.getLabel() != null) this.label = dto.getLabel();
        if (dto.getHref() != null) this.href = dto.getHref();
        if (dto.getClassName() != null) this.className = dto.getClassName();
        if (dto.getPositionTop() != null) this.positionTop = dto.getPositionTop();
        if (dto.getPositionLeft() != null) this.positionLeft = dto.getPositionLeft();
        if (dto.getPositionBottom() != null) this.positionBottom = dto.getPositionBottom();
        if (dto.getPositionRight() != null) this.positionRight = dto.getPositionRight();
        if (dto.getPositionTransform() != null) this.positionTransform = dto.getPositionTransform();
        if (dto.getImageFileId() != null) this.imageFileId = dto.getImageFileId();
        if (dto.getOrder() != null) this.order = dto.getOrder();
        if (dto.getIsActive() != null) this.isActive = dto.getIsActive();
    }

    public LandingCtaResponseDto toResponseDto() {
        return LandingCtaResponseDto.builder()
                .id(this.id)
                .sectionId(this.sectionId)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .label(this.label)
                .href(this.href)
                .className(this.className)
                .positionTop(this.positionTop)
                .positionLeft(this.positionLeft)
                .positionBottom(this.positionBottom)
                .positionRight(this.positionRight)
                .positionTransform(this.positionTransform)
                .imageFileId(this.imageFileId)
                .order(this.order)
                .isActive(this.isActive)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
