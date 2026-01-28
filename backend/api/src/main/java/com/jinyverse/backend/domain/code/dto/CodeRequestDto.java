package com.jinyverse.backend.domain.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRequestDto {

    /** 공통코드 분류 코드 */
    @NotBlank(message = "분류 코드는 필수입니다")
    @Size(max = 40, message = "분류 코드는 40자 이하여야 합니다")
    private String categoryCode;

    /** 공통코드 값 */
    @NotBlank(message = "코드는 필수입니다")
    @Size(max = 40, message = "코드는 40자 이하여야 합니다")
    private String code;

    /** 공통코드 명 */
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
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
    @Size(max = 40, message = "상위 분류 코드는 40자 이하여야 합니다")
    private String upperCategoryCode;

    /** 상위 코드 값 (upper_category_code와 함께 null이거나 함께 사용) */
    @Size(max = 40, message = "상위 코드는 40자 이하여야 합니다")
    private String upperCode;
}
