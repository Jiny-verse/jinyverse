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
public class CodeResponseDto {

    /** 공통코드 분류 코드 */
    private String categoryCode;
    /** 공통코드 값 */
    private String code;
    /** 공통코드 명 */
    private String name;
    /** 코드에 매핑되는 값 */
    private String value;
    /** 코드 설명 */
    private String description;
    /** 비고 */
    private String note;
    /** 정렬 순서 */
    private Integer order;
    /** 상위 코드 분류 (upper_code와 함께 null이거나 함께 사용) */
    private String upperCategoryCode;
    /** 상위 코드 값 (upper_category_code와 함께 null이거나 함께 사용) */
    private String upperCode;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
