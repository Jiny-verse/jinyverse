package com.jinyverse.backend.domain.menu.dto;

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
public class MenuResponseDto {

    /** 메뉴 코드 */
    private String code;
    /** 메뉴 명 */
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
    private String upperCode;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
