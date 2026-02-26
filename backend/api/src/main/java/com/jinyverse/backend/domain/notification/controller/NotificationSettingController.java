package com.jinyverse.backend.domain.notification.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.notification.dto.NotificationSettingRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationSettingResponseDto;
import com.jinyverse.backend.domain.notification.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/settings")
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService settingService;

    @GetMapping
    public ResponseEntity<NotificationSettingResponseDto> get(RequestContext ctx) {
        return ResponseEntity.ok(settingService.getOrCreate(ctx.getCurrentUserId()));
    }

    @PutMapping
    public ResponseEntity<NotificationSettingResponseDto> update(
            @RequestBody NotificationSettingRequestDto dto,
            RequestContext ctx) {
        return ResponseEntity.ok(settingService.update(ctx.getCurrentUserId(), dto));
    }
}
