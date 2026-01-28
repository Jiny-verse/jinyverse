package com.jinyverse.backend.domain.notification.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.notification.dto.NotificationRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationResponseDto;
import com.jinyverse.backend.domain.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(required = false) UUID userId,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel
    ) {
        Page<NotificationResponseDto> responses =
                notificationService.getAll(userId, pageable, RequestContext.fromChannelHeader(channel));
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
}
