package com.jinyverse.backend.domain.code.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeCategoryResponseDto {

    /** 공통코드 분류 식별자 */
    private String code;
    /** 해당 분류 내 코드 수정/추가 가능 여부 */
    private Boolean isSealed;
    /** 공통코드 분류 명 */
    private String name;
    /** 분류 설명 */
    private String description;
    /** 비고 */
    private String note;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 (소프트 삭제) */
    private LocalDateTime deletedAt;
}
