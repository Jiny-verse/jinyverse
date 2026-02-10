package com.jinyverse.backend.domain.topic.entity;

import com.jinyverse.backend.domain.board.entity.Board;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "topic")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic extends BaseEntity {

    /** 게시글 고유 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 게시글 작성자 ID */
    @Column(name = "author_user_id", columnDefinition = "UUID", nullable = false)
    private UUID authorUserId;

    /** 연결된 메뉴 코드 */
    @Column(name = "menu_code", length = 40)
    private String menuCode;

    /** 게시글 상태 분류 코드
     * 값: topic_status */
    @Column(name = "status_category_code", length = 40, nullable = false)
    private String statusCategoryCode;

    /** 게시글 상태 코드 값
     * 값: created, temporary */
    @Column(name = "status", length = 40, nullable = false)
    private String status;

    /** 소속 게시판 ID */
    @Column(name = "board_id", columnDefinition = "UUID", nullable = false)
    private UUID boardId;

    /** 게시글 제목 */
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    /** 게시글 본문 */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /** 공지글 여부 */
    @Column(name = "is_notice", nullable = false)
    private Boolean isNotice;

    /** 상단 고정 여부 */
    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned;

    /** 공개 여부 */
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    /** 조회수 */
    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    /** 원본 게시글 id. 있으면 이 행은 해당 원본의 임시저장(초안). null이면 일반/원본 게시글. */
    @Column(name = "source_topic_id", columnDefinition = "UUID")
    private UUID sourceTopicId;

    /** true면 목록에서 제외. 원본이 초안이 있을 때 true. */
    @Column(name = "hidden", nullable = false)
    @Builder.Default
    private Boolean hidden = false;

    /** 게시글 공개 예정 시각 */
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_topic_id", insertable = false, updatable = false)
    private Topic sourceTopic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_user_id", insertable = false, updatable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", insertable = false, updatable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_category_code", insertable = false, updatable = false)
    private CodeCategory statusCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "status_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "status", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code statusCode;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.jinyverse.backend.domain.comment.entity.Comment> comments = new ArrayList<>();

    public static Topic fromRequestDto(TopicRequestDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("TopicRequestDto is null");
        }
        String status = blankToNull(dto.getStatus()) != null ? dto.getStatus() : "created";
        boolean isPublic = !"temporary".equals(status) && (dto.getIsPublic() != null ? dto.getIsPublic() : true);
        return Topic.builder()
                .authorUserId(dto.getAuthorUserId())
                .menuCode(dto.getMenuCode())
                .statusCategoryCode(blankToNull(dto.getStatusCategoryCode()) != null ? dto.getStatusCategoryCode() : "topic_status")
                .status(status)
                .boardId(dto.getBoardId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .isNotice(dto.getIsNotice() != null ? dto.getIsNotice() : false)
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false)
                .isPublic(isPublic)
                .viewCount(0)
                .hidden(false)
                .publishedAt(dto.getPublishedAt())
                .build();
    }

    /** 원본 topic + 요청으로 초안 행 생성 (id는 자동 생성, sourceTopicId=원본.id) */
    public static Topic draftOf(Topic original, TopicRequestDto dto) {
        return Topic.builder()
                .authorUserId(dto.getAuthorUserId() != null ? dto.getAuthorUserId() : original.getAuthorUserId())
                .menuCode(dto.getMenuCode() != null ? dto.getMenuCode() : original.getMenuCode())
                .statusCategoryCode(blankToNull(dto.getStatusCategoryCode()) != null ? dto.getStatusCategoryCode() : original.getStatusCategoryCode())
                .status("temporary")
                .boardId(dto.getBoardId() != null ? dto.getBoardId() : original.getBoardId())
                .title(dto.getTitle() != null ? dto.getTitle() : original.getTitle())
                .content(dto.getContent() != null ? dto.getContent() : original.getContent())
                .isNotice(dto.getIsNotice() != null ? dto.getIsNotice() : original.getIsNotice())
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : original.getIsPinned())
                .isPublic(false)
                .viewCount(0)
                .sourceTopicId(original.getId())
                .hidden(false)
                .publishedAt(dto.getPublishedAt())
                .build();
    }

    private static String blankToNull(String s) {
        return s != null && !s.isBlank() ? s : null;
    }

    public void applyUpdate(TopicRequestDto dto) {
        if (dto == null) return;
        if (dto.getMenuCode() != null) this.menuCode = dto.getMenuCode();
        if (dto.getStatusCategoryCode() != null) this.statusCategoryCode = dto.getStatusCategoryCode();
        if (dto.getStatus() != null) this.status = dto.getStatus();
        if (dto.getTitle() != null) this.title = dto.getTitle();
        if (dto.getContent() != null) this.content = dto.getContent();
        if (dto.getIsNotice() != null) this.isNotice = dto.getIsNotice();
        if (dto.getIsPinned() != null) this.isPinned = dto.getIsPinned();
        if (dto.getIsPublic() != null) this.isPublic = dto.getIsPublic();
        if (dto.getPublishedAt() != null) this.publishedAt = dto.getPublishedAt();
    }

    public TopicRequestDto toDto() {
        return TopicRequestDto.builder()
                .authorUserId(this.authorUserId)
                .menuCode(this.menuCode)
                .statusCategoryCode(this.statusCategoryCode)
                .status(this.status)
                .boardId(this.boardId)
                .title(this.title)
                .content(this.content)
                .isNotice(this.isNotice)
                .isPinned(this.isPinned)
                .isPublic(this.isPublic)
                .publishedAt(this.publishedAt)
                .build();
    }

    public TopicResponseDto toResponseDto() {
        return TopicResponseDto.builder()
                .id(this.id)
                .authorUserId(this.authorUserId)
                .menuCode(this.menuCode)
                .statusCategoryCode(this.statusCategoryCode)
                .status(this.status)
                .boardId(this.boardId)
                .title(this.title)
                .content(this.content)
                .isNotice(this.isNotice)
                .isPinned(this.isPinned)
                .isPublic(this.isPublic)
                .viewCount(this.viewCount)
                .sourceTopicId(this.sourceTopicId)
                .hidden(this.hidden)
                .publishedAt(this.publishedAt)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
