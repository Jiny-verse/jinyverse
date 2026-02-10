package com.jinyverse.backend.domain.comment.dto;

import com.jinyverse.backend.domain.user.dto.UserJoinDto;
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
public class CommentResponseDto {

    /** 댓글 ID */
    private UUID id;
    /** 게시글 ID */
    private UUID topicId;
    /** 작성자 */
    private UserJoinDto author;
    /** 상위 댓글 ID */
    private UUID upperCommentId;
    /** 댓글 내용 */
    private String content;
    /** 삭제 여부 */
    private Boolean isDeleted;
    /** 작성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
