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

    /** 메뉴 코드 (생성 시 필수, 수정 시 선택·path와 별도로 변경 가능) */
    @NotBlank(message = "메뉴 코드는 필수입니다", groups = CreateGroup.class)
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

    /** 상위 메뉴 ID (자기참조) */
    private java.util.UUID upperId;

    /** 메뉴 표시 채널 분류 코드 (menu_channel) */
    @Size(max = 40, message = "채널 분류 코드는 40자 이하여야 합니다")
    private String channelCategoryCode;

    /** 메뉴 표시 채널 코드: INTERNAL, EXTERNAL, PUBLIC */
    @Size(max = 40, message = "채널 코드는 40자 이하여야 합니다")
    private String channel;

    /** 메뉴 기본 링크(경로/URL). 게시판·게시글 연동 없을 때 사용 */
    @Size(max = 500, message = "경로는 500자 이하여야 합니다")
    private String path;
}
