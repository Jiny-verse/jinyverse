package com.jinyverse.backend.domain.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/** 메뉴 클릭 시 이동할 대상: board(게시판 리스트), topic(게시글), link(메뉴 기본 경로) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuResolveResponseDto {
    private String type;
    private UUID boardId;
    private UUID topicId;
    private String path;
}
