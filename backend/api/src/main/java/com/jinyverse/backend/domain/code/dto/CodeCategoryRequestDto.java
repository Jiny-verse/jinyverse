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
public class CodeCategoryRequestDto {

    /** 공통코드 분류 식별자 */
    @NotBlank(message = "코드는 필수입니다")
    @Size(max = 40, message = "코드는 40자 이하여야 합니다")
    private String code;

    /** 해당 분류 내 코드 수정/추가 가능 여부 */
    private Boolean isSealed;

    /** 공통코드 분류 명 */
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;

    /** 분류 설명 */
    private String description;

    /** 비고 */
    private String note;
}
