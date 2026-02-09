package com.jinyverse.backend.domain.menu.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "menu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu extends BaseEntity {

    /** 메뉴 고유 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 메뉴 코드 (수정 가능, UNIQUE) */
    @Column(name = "code", length = 40, nullable = false, unique = true)
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

    /** 상위 메뉴 ID (자기참조) */
    @Column(name = "upper_id", columnDefinition = "UUID")
    private UUID upperId;

    /** 메뉴 표시 채널 분류 코드 (menu_channel) */
    @Column(name = "channel_category_code", length = 40, nullable = false)
    private String channelCategoryCode;

    /** 메뉴 표시 채널 코드: INTERNAL, EXTERNAL, PUBLIC */
    @Column(name = "channel", length = 40, nullable = false)
    private String channel;

    /** 메뉴 기본 링크(경로/URL). 게시판·게시글 연동 없을 때 사용 */
    @Column(name = "path", length = 500)
    private String path;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upper_id", insertable = false, updatable = false)
    private Menu upperMenu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "channel_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "channel", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code channelCode;

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
                .upperId(dto.getUpperId())
                .channelCategoryCode(dto.getChannelCategoryCode() != null && !dto.getChannelCategoryCode().isBlank() ? dto.getChannelCategoryCode() : "menu_channel")
                .channel(dto.getChannel() != null && !dto.getChannel().isBlank() ? dto.getChannel() : "INTERNAL")
                .path(dto.getPath())
                .build();
    }

    public void applyUpdate(MenuRequestDto dto) {
        if (dto == null) return;
        if (dto.getCode() != null && !dto.getCode().isBlank()) this.code = dto.getCode().trim();
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getDescription() != null) this.description = dto.getDescription();
        if (dto.getIsActive() != null) this.isActive = dto.getIsActive();
        if (dto.getIsAdmin() != null) this.isAdmin = dto.getIsAdmin();
        if (dto.getOrder() != null) this.order = dto.getOrder();
        if (dto.getUpperId() != null) this.upperId = dto.getUpperId();
        else this.upperId = null;
        if (dto.getChannelCategoryCode() != null && !dto.getChannelCategoryCode().isBlank()) this.channelCategoryCode = dto.getChannelCategoryCode();
        if (dto.getChannel() != null && !dto.getChannel().isBlank()) this.channel = dto.getChannel();
        if (dto.getPath() != null) this.path = dto.getPath();
    }

    public MenuRequestDto toDto() {
        return MenuRequestDto.builder()
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .isActive(this.isActive)
                .isAdmin(this.isAdmin)
                .order(this.order)
                .upperId(this.upperId)
                .channelCategoryCode(this.channelCategoryCode)
                .channel(this.channel)
                .path(this.path)
                .build();
    }

    public MenuResponseDto toResponseDto() {
        return MenuResponseDto.builder()
                .id(this.id)
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .isActive(this.isActive)
                .isAdmin(this.isAdmin)
                .order(this.order)
                .upperId(this.upperId)
                .channelCategoryCode(this.channelCategoryCode)
                .channel(this.channel)
                .path(this.path)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
