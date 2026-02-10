package com.jinyverse.backend.domain.comment.entity;

import com.jinyverse.backend.domain.comment.dto.CommentRequestDto;
import com.jinyverse.backend.domain.comment.dto.CommentResponseDto;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.user.entity.User;
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
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment extends BaseEntity {

    /** 댓글 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 게시글 ID */
    @Column(name = "topic_id", columnDefinition = "UUID", nullable = false)
    private UUID topicId;

    /** 작성자 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    private UUID userId;

    /** 상위 댓글 ID */
    @Column(name = "upper_comment_id", columnDefinition = "UUID")
    private UUID upperCommentId;

    /** 댓글 내용 */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /** 삭제 여부 */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", insertable = false, updatable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upper_comment_id", insertable = false, updatable = false)
    private Comment upperComment;

    @OneToMany(mappedBy = "upperComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> replies = new ArrayList<>();

    public static Comment fromRequestDto(CommentRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("CommentRequestDto is null");
        return Comment.builder()
                .topicId(dto.getTopicId())
                .userId(dto.getUserId())
                .upperCommentId(dto.getUpperCommentId())
                .content(dto.getContent())
                .isDeleted(false)
                .build();
    }

    public void applyUpdate(CommentRequestDto dto) {
        if (dto == null) return;
        if (dto.getContent() != null) this.content = dto.getContent();
    }

    public CommentRequestDto toDto() {
        return CommentRequestDto.builder()
                .topicId(this.topicId)
                .userId(this.userId)
                .upperCommentId(this.upperCommentId)
                .content(this.content)
                .build();
    }

    public CommentResponseDto toResponseDto() {
        return CommentResponseDto.builder()
                .id(this.id)
                .topicId(this.topicId)
                .author(this.user != null ? this.user.toJoinDto() : null)
                .upperCommentId(this.upperCommentId)
                .content(this.content)
                .isDeleted(this.isDeleted)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
