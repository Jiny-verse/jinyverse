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
public class RelTopicTagDto {

    /** 게시글-태그 연결 ID */
    private UUID id;
    /** 게시글 ID */
    private UUID topicId;
    /** 태그 ID */
    private UUID tagId;
    /** 연결 생성일시 */
    private LocalDateTime createdAt;
}
