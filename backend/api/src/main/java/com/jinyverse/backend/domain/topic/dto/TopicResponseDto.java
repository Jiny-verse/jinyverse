package com.jinyverse.backend.domain.topic.dto;

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
public class TopicResponseDto {

    /** 게시글 고유 ID */
    private UUID id;
    /** 게시글 작성자 ID */
    private UUID authorUserId;
    /** 연결된 메뉴 코드 */
    private String menuCode;
    /** 게시글 상태 분류 코드 */
    private String statusCategoryCode;
    /** 게시글 상태 코드 값 */
    private String status;
    /** 소속 게시판 ID */
    private UUID boardId;
    /** 게시글 제목 */
    private String title;
    /** 게시글 본문 */
    private String content;
    /** 공지글 여부 */
    private Boolean isNotice;
    /** 상단 고정 여부 */
    private Boolean isPinned;
    /** 공개 여부 */
    private Boolean isPublic;
    /** 조회수 */
    private Integer viewCount;
    /** 원본 게시글 id. 있으면 이 행은 해당 원본의 임시저장(초안). */
    private UUID sourceTopicId;
    /** true면 목록에서 제외. */
    private Boolean hidden;
    /** 게시글 공개 예정 시각 */
    private LocalDateTime publishedAt;
    /** 작성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
