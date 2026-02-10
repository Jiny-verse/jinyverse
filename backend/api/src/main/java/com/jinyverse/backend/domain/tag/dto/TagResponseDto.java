package com.jinyverse.backend.domain.tag.dto;

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
public class TagResponseDto {

    /** 태그 ID */
    private UUID id;
    /** 태그 명 */
    private String name;
    /** 태그 설명 */
    private String description;
    /** 태그 용도 분류 코드 */
    private String usageCategoryCode;
    /** 태그 용도 코드 */
    private String usage;
    /** 생성일시 */
    private LocalDateTime createdAt;
}
