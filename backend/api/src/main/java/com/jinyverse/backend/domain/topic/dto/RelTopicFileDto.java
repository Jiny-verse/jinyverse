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
public class RelTopicFileDto {

    /** 게시글-파일 연결 ID */
    private UUID id;
    /** 게시글 ID */
    private UUID topicId;
    /** 파일 ID */
    private UUID fileId;
    /** 게시글 내 파일 정렬 순서 */
    private Integer order;
    /** 대표 파일 여부 */
    private Boolean isMain;
    /** 연결 생성일시 */
    private LocalDateTime createdAt;
}
