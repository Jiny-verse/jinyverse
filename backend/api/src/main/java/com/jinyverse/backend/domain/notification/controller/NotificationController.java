package com.jinyverse.backend.domain.notification.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.notification.dto.NotificationRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationResponseDto;
import com.jinyverse.backend.domain.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDto> create(@Valid @RequestBody NotificationRequestDto requestDto) {
        NotificationResponseDto response = notificationService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            RequestContext ctx
    ) {
        Page<NotificationResponseDto> responses = notificationService.getAll(filter, pageable, ctx);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> getById(@PathVariable UUID id) {
        NotificationResponseDto response = notificationService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody NotificationRequestDto requestDto) {
        NotificationResponseDto response = notificationService.update(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** 미읽음 카운트 */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(RequestContext ctx) {
        long count = notificationService.countUnread(ctx.getCurrentUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** 단건 읽음 처리 */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable UUID id, RequestContext ctx) {
        return ResponseEntity.ok(notificationService.markAsRead(id, ctx.getCurrentUserId()));
    }

    /** 전체 읽음 처리 */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(RequestContext ctx) {
        notificationService.markAllAsRead(ctx.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
