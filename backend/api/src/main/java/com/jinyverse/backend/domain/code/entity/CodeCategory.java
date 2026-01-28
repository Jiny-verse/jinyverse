package com.jinyverse.backend.domain.code.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.code.dto.CodeCategoryRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeCategoryResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "code_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeCategory extends BaseEntity {

    /** 공통코드 분류 식별자 */
    @Id
    @Column(name = "code", length = 40, nullable = false)
    private String code;

    /** 해당 분류 내 코드 수정/추가 가능 여부 */
    @Column(name = "is_sealed", nullable = false)
    private Boolean isSealed;

    /** 공통코드 분류 명 */
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /** 분류 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 비고 */
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Code> codes = new ArrayList<>();

    @OneToMany(mappedBy = "upperCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Code> upperCodes = new ArrayList<>();

    public CodeCategoryRequestDto toDto() {
        return CodeCategoryRequestDto.builder()
                .code(this.code)
                .isSealed(this.isSealed)
                .name(this.name)
                .description(this.description)
                .note(this.note)
                .build();
    }

    public CodeCategoryResponseDto toResponseDto() {
        return CodeCategoryResponseDto.builder()
                .code(this.code)
                .isSealed(this.isSealed)
                .name(this.name)
                .description(this.description)
                .note(this.note)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }

    public static CodeCategory fromRequestDto(CodeCategoryRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("CodeCategoryRequestDto is null");
        return CodeCategory.builder()
                .code(dto.getCode())
                .isSealed(dto.getIsSealed() != null ? dto.getIsSealed() : false)
                .name(dto.getName())
                .description(dto.getDescription())
                .note(dto.getNote())
                .build();
    }

    public void applyUpdate(CodeCategoryRequestDto dto) {
        if (dto == null) return;
        if (dto.getIsSealed() != null) this.isSealed = dto.getIsSealed();
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getNote() != null) this.note = dto.getNote();
    }
}
