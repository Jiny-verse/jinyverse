package com.jinyverse.backend.domain.topic.dto;

import com.jinyverse.backend.domain.menu.dto.CreateGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicRequestDto {

    /** 게시글 작성자 ID (생성 시 필수, 수정 시 선택) */
    @NotNull(message = "작성자 ID는 필수입니다", groups = CreateGroup.class)
    private UUID authorUserId;

    /** 연결된 메뉴 코드 */
    @Size(max = 40, message = "메뉴 코드는 40자 이하여야 합니다")
    private String menuCode;

    /** 게시글 상태 분류 코드 (미입력 시 topic_status) */
    @Size(max = 40, message = "상태 분류 코드는 40자 이하여야 합니다")
    private String statusCategoryCode;

    /** 게시글 상태 코드 값 (미입력 시 created) */
    @Size(max = 40, message = "상태는 40자 이하여야 합니다")
    private String status;

    /** 소속 게시판 ID (생성 시 필수, 수정 시 선택) */
    @NotNull(message = "게시판 ID는 필수입니다", groups = CreateGroup.class)
    private UUID boardId;

    /** 게시글 제목 (생성 시 필수, 수정 시 선택) */
    @NotBlank(message = "제목은 필수입니다", groups = CreateGroup.class)
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;

    /** 게시글 본문 (생성 시 필수, 수정 시 선택) */
    @NotBlank(message = "내용은 필수입니다", groups = CreateGroup.class)
    private String content;

    /** 공지글 여부 */
    private Boolean isNotice;

    /** 상단 고정 여부 */
    private Boolean isPinned;

    /** 공개 여부 */
    private Boolean isPublic;

    /** 게시글 공개 예정 시각 */
    private LocalDateTime publishedAt;

    /** 연결할 태그 ID 목록 (rel 연결 테이블용, 선택) */
    private List<UUID> tagIds;

    /** 파일 목록 */
    private List<TopicFileItemDto> files;
}
