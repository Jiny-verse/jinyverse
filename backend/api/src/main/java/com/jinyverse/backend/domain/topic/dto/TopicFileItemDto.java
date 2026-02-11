package com.jinyverse.backend.domain.topic.dto;

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
public class TopicFileItemDto {

    private UUID fileId;
    private Integer order;
    private Boolean isMain;
}
