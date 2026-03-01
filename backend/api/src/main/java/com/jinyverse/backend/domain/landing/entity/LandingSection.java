package com.jinyverse.backend.domain.landing.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.landing.dto.LandingCtaResponseDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "landing_section")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingSection extends BaseEntity {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    @Column(name = "type", length = 40, nullable = false)
    private String type;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "board_id", columnDefinition = "UUID")
    private UUID boardId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "order", nullable = false)
    private Integer order;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_config", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> extraConfig = new java.util.HashMap<>();

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @Builder.Default
    private List<LandingCta> ctas = new ArrayList<>();

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @Builder.Default
    private List<LandingSectionFile> files = new ArrayList<>();

    public static LandingSection fromRequestDto(LandingSectionRequestDto dto) {
        return LandingSection.builder()
                .typeCategoryCode("landing_section_type")
                .type(dto.getType())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .boardId(dto.getBoardId())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .order(dto.getOrder() != null ? dto.getOrder() : 0)
                .extraConfig(dto.getExtraConfig() != null ? dto.getExtraConfig() : new java.util.HashMap<>())
                .build();
    }

    public void applyUpdate(LandingSectionRequestDto dto) {
        if (dto.getType() != null) this.type = dto.getType();
        if (dto.getTitle() != null) this.title = dto.getTitle();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getBoardId() != null) this.boardId = dto.getBoardId();
        if (dto.getIsActive() != null) this.isActive = dto.getIsActive();
        if (dto.getOrder() != null) this.order = dto.getOrder();
        if (dto.getExtraConfig() != null) this.extraConfig = dto.getExtraConfig();
    }

    public LandingSectionResponseDto toResponseDto(List<LandingCtaResponseDto> ctaDtos) {
        return LandingSectionResponseDto.builder()
                .id(this.id)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .title(this.title)
                .description(this.description)
                .boardId(this.boardId)
                .isActive(this.isActive)
                .order(this.order)
                .extraConfig(this.extraConfig)
                .ctas(ctaDtos)
                .fileIds(this.files.stream().map(f -> f.getFileId()).toList())
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
