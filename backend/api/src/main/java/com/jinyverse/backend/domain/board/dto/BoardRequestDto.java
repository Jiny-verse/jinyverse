package com.jinyverse.backend.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardRequestDto {

    /** 연결된 메뉴 코드 */
    @Size(max = 40, message = "메뉴 코드는 40자 이하여야 합니다")
    private String menuCode;

    /** 게시판 타입 분류 코드 (미입력 시 board_type) */
    @Size(max = 40, message = "타입 분류 코드는 40자 이하여야 합니다")
    private String typeCategoryCode;

    /** 게시판 타입 코드 값 (미입력 시 project) */
    @Size(max = 40, message = "타입은 40자 이하여야 합니다")
    private String type;

    /** 게시판 명 */
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;

    /** 게시판 설명 */
    private String description;

    /** 비고 */
    private String note;

    /** 게시판 공개 여부 */
    private Boolean isPublic;

    /** 게시판 정렬 순서 */
    private Integer order;
}
