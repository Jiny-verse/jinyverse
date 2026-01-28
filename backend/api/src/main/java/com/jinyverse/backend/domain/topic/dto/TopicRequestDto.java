package com.jinyverse.backend.domain.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class TopicRequestDto {

    /** 게시글 작성자 ID */
    @NotNull(message = "작성자 ID는 필수입니다")
    private UUID authorUserId;

    /** 연결된 메뉴 코드 */
    @Size(max = 40, message = "메뉴 코드는 40자 이하여야 합니다")
    private String menuCode;

    /** 게시글 상태 분류 코드 */
    @NotBlank(message = "상태 분류 코드는 필수입니다")
    @Size(max = 40, message = "상태 분류 코드는 40자 이하여야 합니다")
    private String statusCategoryCode;

    /** 게시글 상태 코드 값 */
    @NotBlank(message = "상태는 필수입니다")
    @Size(max = 40, message = "상태는 40자 이하여야 합니다")
    private String status;

    /** 소속 게시판 ID */
    @NotNull(message = "게시판 ID는 필수입니다")
    private UUID boardId;

    /** 게시글 제목 */
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;

    /** 게시글 본문 */
    @NotBlank(message = "내용은 필수입니다")
    private String content;

    /** 공지글 여부 */
    private Boolean isNotice;

    /** 상단 고정 여부 */
    private Boolean isPinned;

    /** 공개 여부 */
    private Boolean isPublic;

    /** 게시글 공개 예정 시각 */
    private LocalDateTime publishedAt;
}
