package com.jinyverse.backend.domain.setting.controller;

import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.setting.dto.FileStorageSettingDto;
import com.jinyverse.backend.domain.setting.service.SystemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** 관리자 전용: 시스템 설정 (파일 저장 경로 등). INTERNAL + ADMIN만 허용. */
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping("/file-storage")
    public ResponseEntity<FileStorageSettingDto> getFileStorageSetting(
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(systemSettingService.getFileStorageSetting());
    }

    @PostMapping("/file-storage")
    public ResponseEntity<FileStorageSettingDto> updateFileStorageSetting(
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role,
            @Valid @RequestBody FileStorageSettingDto dto
    ) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(systemSettingService.updateFileStorageSetting(dto));
    }
}
