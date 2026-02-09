package com.jinyverse.backend.domain.menu.controller;

import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import com.jinyverse.backend.domain.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** 메뉴 관리 전용: 채널 필터 없이 전체 조회. INTERNAL + ADMIN만 허용. */
@RestController
@RequestMapping("/api/admin/menus")
@RequiredArgsConstructor
public class AdminMenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<Page<MenuResponseDto>> getAllForManagement(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        Page<MenuResponseDto> responses = menuService.getAllForManagement(filter, pageable);
        return ResponseEntity.ok(responses);
    }
}
