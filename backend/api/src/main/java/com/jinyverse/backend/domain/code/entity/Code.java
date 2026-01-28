package com.jinyverse.backend.domain.code.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.code.dto.CodeRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "code")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CodeId.class)
public class Code extends BaseEntity {

    /** 공통코드 분류 코드 */
    @Id
    @Column(name = "category_code", length = 40, nullable = false)
    private String categoryCode;

    /** 공통코드 값 */
    @Id
    @Column(name = "code", length = 40, nullable = false)
    private String code;

    /** 공통코드 명 */
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /** 코드에 매핑되는 값 */
    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    /** 코드 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 비고 */
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /** 정렬 순서 */
    @Column(name = "order", nullable = false)
    private Integer order;

    /** 상위 코드 분류 (upper_code와 함께 null이거나 함께 사용) */
    @Column(name = "upper_category_code", length = 40)
    private String upperCategoryCode;

    /** 상위 코드 값 (upper_category_code와 함께 null이거나 함께 사용) */
    @Column(name = "upper_code", length = 40)
    private String upperCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_code", insertable = false, updatable = false)
    private CodeCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upper_category_code", insertable = false, updatable = false)
    private CodeCategory upperCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "upper_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "upper_code", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code upperCodeEntity;

    public static Code fromRequestDto(CodeRequestDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("CodeRequestDto is null");
        }
        return Code.builder()
                .categoryCode(dto.getCategoryCode())
                .code(dto.getCode())
                .name(dto.getName())
                .value(dto.getValue())
                .description(dto.getDescription())
                .note(dto.getNote())
                .order(dto.getOrder() != null ? dto.getOrder() : 0)
                .upperCategoryCode(dto.getUpperCategoryCode())
                .upperCode(dto.getUpperCode())
                .build();
    }

    public void applyUpdate(CodeRequestDto dto) {
        if (dto == null) return;
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getValue() != null) this.value = dto.getValue();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getNote() != null) this.note = dto.getNote();
        if (dto.getOrder() != null) this.order = dto.getOrder();
        if (dto.getUpperCategoryCode() != null) this.upperCategoryCode = dto.getUpperCategoryCode();
        if (dto.getUpperCode() != null) this.upperCode = dto.getUpperCode();
    }

    public CodeRequestDto toDto() {
        return CodeRequestDto.builder()
                .categoryCode(this.categoryCode)
                .code(this.code)
                .name(this.name)
                .value(this.value)
                .description(this.description)
                .note(this.note)
                .order(this.order)
                .upperCategoryCode(this.upperCategoryCode)
                .upperCode(this.upperCode)
                .build();
    }

    public CodeResponseDto toResponseDto() {
        return CodeResponseDto.builder()
                .categoryCode(this.categoryCode)
                .code(this.code)
                .name(this.name)
                .value(this.value)
                .description(this.description)
                .note(this.note)
                .order(this.order)
                .upperCategoryCode(this.upperCategoryCode)
                .upperCode(this.upperCode)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
