package com.jinyverse.backend.domain.menu.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu extends BaseEntity {

    /** 메뉴 코드 */
    @Id
    @Column(name = "code", length = 40, nullable = false)
    private String code;

    /** 메뉴 명 */
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /** 메뉴 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 메뉴 활성 여부 */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    /** 관리자 전용 메뉴 여부 */
    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin;

    /** 메뉴 정렬 순서 */
    @Column(name = "order", nullable = false)
    private Integer order;

    /** 상위 메뉴 코드 */
    @Column(name = "upper_code", length = 40)
    private String upperCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upper_code", insertable = false, updatable = false)
    private Menu upperMenu;

    @OneToMany(mappedBy = "upperMenu", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Menu> subMenus = new ArrayList<>();

    public static Menu fromRequestDto(MenuRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("MenuRequestDto is null");
        return Menu.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .isAdmin(dto.getIsAdmin() != null ? dto.getIsAdmin() : false)
                .order(dto.getOrder() != null ? dto.getOrder() : 0)
                .upperCode(dto.getUpperCode())
                .build();
    }

    public void applyUpdate(MenuRequestDto dto) {
        if (dto == null) return;
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getIsActive() != null) this.isActive = dto.getIsActive();
        if (dto.getIsAdmin() != null) this.isAdmin = dto.getIsAdmin();
        if (dto.getOrder() != null) this.order = dto.getOrder();
        if (dto.getUpperCode() != null) this.upperCode = dto.getUpperCode();
    }

    public MenuRequestDto toDto() {
        return MenuRequestDto.builder()
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .isActive(this.isActive)
                .isAdmin(this.isAdmin)
                .order(this.order)
                .upperCode(this.upperCode)
                .build();
    }

    public MenuResponseDto toResponseDto() {
        return MenuResponseDto.builder()
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .isActive(this.isActive)
                .isAdmin(this.isAdmin)
                .order(this.order)
                .upperCode(this.upperCode)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
