package com.jinyverse.backend.domain.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponseDto {

    /** 게시판 고유 ID */
    private UUID id;
    /** 연결된 메뉴 코드 */
    private String menuCode;
    /** 게시판 타입 분류 코드 (board_type) */
    private String typeCategoryCode;
    /** 게시판 타입 코드 값 */
    private String type;
    /** 게시판 명 */
    private String name;
    /** 게시판 설명 */
    private String description;
    /** 비고 */
    private String note;
    /** 게시판 공개 여부 */
    private Boolean isPublic;
    /** 게시판 정렬 순서 */
    private Integer order;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
