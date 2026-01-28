package com.jinyverse.backend.domain.menu.dto;

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
public class MenuRequestDto {

    /** 메뉴 코드 */
    @NotBlank(message = "메뉴 코드는 필수입니다")
    @Size(max = 40, message = "메뉴 코드는 40자 이하여야 합니다")
    private String code;

    /** 메뉴 명 */
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;

    /** 메뉴 설명 */
    private String description;

    /** 메뉴 활성 여부 */
    private Boolean isActive;

    /** 관리자 전용 메뉴 여부 */
    private Boolean isAdmin;

    /** 메뉴 정렬 순서 */
    private Integer order;

    /** 상위 메뉴 코드 */
    @Size(max = 40, message = "상위 메뉴 코드는 40자 이하여야 합니다")
    private String upperCode;
}
