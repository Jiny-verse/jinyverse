package com.jinyverse.backend.domain.menu.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import com.jinyverse.backend.domain.menu.entity.Menu;
import com.jinyverse.backend.domain.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;

    @Transactional
    public MenuResponseDto create(MenuRequestDto requestDto) {
        Menu menu = Menu.fromRequestDto(requestDto);
        Menu saved = menuRepository.save(menu);
        return saved.toResponseDto();
    }

    public MenuResponseDto getByCode(String code) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));
        return menu.toResponseDto();
    }

    public Page<MenuResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return menuRepository.findAll(spec(ctx), pageable).map(Menu::toResponseDto);
    }

    @Transactional
    public MenuResponseDto update(String code, MenuRequestDto requestDto) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));

        menu.applyUpdate(requestDto);
        Menu updated = menuRepository.save(menu);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(String code) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));

        menu.setDeletedAt(LocalDateTime.now());
        menuRepository.save(menu);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Menu> spec(RequestContext ctx) {
        Specification<Menu> result = CommonSpecifications.notDeleted();

        // INTERNAL 채널일 때만 비활성 메뉴 조회 가능
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            result = result.and(CommonSpecifications.eqIfPresent("isActive", true));
        }

        return result;
    }
}
