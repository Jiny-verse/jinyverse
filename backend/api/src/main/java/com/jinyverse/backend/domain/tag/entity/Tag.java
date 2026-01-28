package com.jinyverse.backend.domain.tag.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
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

    public static Tag fromRequestDto(TagRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("TagRequestDto is null");
        return Tag.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    public void applyUpdate(TagRequestDto dto) {
        if (dto == null) return;
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
    }

    public TagRequestDto toDto() {
        return TagRequestDto.builder()
                .name(this.name)
                .description(this.description)
                .build();
    }

    public TagResponseDto toResponseDto() {
        return TagResponseDto.builder()
                .id(this.id)
                .name(this.name)
                .description(this.description)
                .createdAt(this.getCreatedAt())
                .build();
    }
}
