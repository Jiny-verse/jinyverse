package com.jinyverse.backend.domain.comment.dto;

import com.jinyverse.backend.domain.menu.dto.CreateGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequestDto {

    /** 게시글 ID */
    @NotNull(message = "게시글 ID는 필수입니다", groups = CreateGroup.class)
    private UUID topicId;

    /** 작성자 사용자 ID */
    @NotNull(message = "사용자 ID는 필수입니다", groups = CreateGroup.class)
    private UUID userId;

    /** 상위 댓글 ID */
    private UUID upperCommentId;

    /** 댓글 내용 */
    @NotBlank(message = "내용은 필수입니다")
    private String content;
}
