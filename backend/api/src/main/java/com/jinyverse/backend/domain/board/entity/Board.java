package com.jinyverse.backend.domain.board.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.board.dto.BoardRequestDto;
import com.jinyverse.backend.domain.board.dto.BoardResponseDto;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.topic.entity.Topic;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board extends BaseEntity {

    /** 게시판 고유 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 연결된 메뉴 코드 (외래키 없음, 코드 일치 시 매칭) */
    @Column(name = "menu_code", length = 40)
    private String menuCode;

    /** 게시판 타입 분류 코드
     * 값: board_type */
    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    /** 게시판 타입 코드 값
     * 값: project, notice, qna, free */
    @Column(name = "type", length = 40, nullable = false)
    private String type;

    /** 게시판 명 */
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /** 게시판 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 비고 */
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /** 게시판 공개 여부 */
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    /** 게시판 정렬 순서 */
    @Column(name = "order", nullable = false)
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_category_code", insertable = false, updatable = false)
    private CodeCategory typeCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "type_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "type", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code typeCode;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Topic> topics = new ArrayList<>();

    public static Board fromRequestDto(BoardRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("BoardRequestDto is null");
        return Board.builder()
                .menuCode(dto.getMenuCode())
                .typeCategoryCode(blankToNull(dto.getTypeCategoryCode()) != null ? dto.getTypeCategoryCode() : "board_type")
                .type(blankToNull(dto.getType()) != null ? dto.getType() : "project")
                .name(dto.getName())
                .description(dto.getDescription())
                .note(dto.getNote())
                .isPublic(dto.getIsPublic() != null ? dto.getIsPublic() : true)
                .order(dto.getOrder() != null ? dto.getOrder() : 0)
                .build();
    }

    private static String blankToNull(String s) {
        return s != null && !s.isBlank() ? s : null;
    }

    public void applyUpdate(BoardRequestDto dto) {
        if (dto == null) return;
        if (dto.getMenuCode() != null) this.menuCode = dto.getMenuCode();
        if (dto.getTypeCategoryCode() != null) this.typeCategoryCode = dto.getTypeCategoryCode();
        if (dto.getType() != null) this.type = dto.getType();
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getNote() != null) this.note = dto.getNote();
        if (dto.getIsPublic() != null) this.isPublic = dto.getIsPublic();
        if (dto.getOrder() != null) this.order = dto.getOrder();
    }

    public BoardRequestDto toDto() {
        return BoardRequestDto.builder()
                .menuCode(this.menuCode)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .name(this.name)
                .description(this.description)
                .note(this.note)
                .isPublic(this.isPublic)
                .order(this.order)
                .build();
    }

    public BoardResponseDto toResponseDto() {
        return BoardResponseDto.builder()
                .id(this.id)
                .menuCode(this.menuCode)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .name(this.name)
                .description(this.description)
                .note(this.note)
                .isPublic(this.isPublic)
                .order(this.order)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
