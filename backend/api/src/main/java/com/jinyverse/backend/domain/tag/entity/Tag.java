package com.jinyverse.backend.domain.tag.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.tag.dto.TagRequestDto;
import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag extends BaseEntity {

    private static final String DEFAULT_USAGE_CATEGORY = "tag_usage";
    private static final String DEFAULT_USAGE = "topic";

    /** 태그 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 태그 명 */
    @Column(name = "name", length = 50, nullable = false, unique = true)
    private String name;

    /** 태그 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 태그 용도 분류 코드 (code_category.code, 기본: tag_usage) */
    @Column(name = "usage_category_code", length = 40, nullable = false)
    private String usageCategoryCode;

    /** 태그 용도 코드 (code.code, 예: topic, board) */
    @Column(name = "usage", length = 40, nullable = false)
    private String usage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_category_code", insertable = false, updatable = false)
    private CodeCategory usageCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "usage_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "usage", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code usageCode;

    public static Tag fromRequestDto(TagRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("TagRequestDto is null");
        return Tag.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .usageCategoryCode(blankToNull(dto.getUsageCategoryCode()) != null ? dto.getUsageCategoryCode() : DEFAULT_USAGE_CATEGORY)
                .usage(blankToNull(dto.getUsage()) != null ? dto.getUsage() : DEFAULT_USAGE)
                .build();
    }

    public void applyUpdate(TagRequestDto dto) {
        if (dto == null) return;
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getUsageCategoryCode() != null) this.usageCategoryCode = dto.getUsageCategoryCode();
        if (dto.getUsage() != null) this.usage = dto.getUsage();
    }

    public TagRequestDto toDto() {
        return TagRequestDto.builder()
                .name(this.name)
                .description(this.description)
                .usageCategoryCode(this.usageCategoryCode)
                .usage(this.usage)
                .build();
    }

    public TagResponseDto toResponseDto() {
        return TagResponseDto.builder()
                .id(this.id)
                .name(this.name)
                .description(this.description)
                .usageCategoryCode(this.usageCategoryCode)
                .usage(this.usage)
                .createdAt(this.getCreatedAt())
                .build();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}
