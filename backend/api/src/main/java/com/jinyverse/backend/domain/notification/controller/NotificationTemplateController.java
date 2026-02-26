package com.jinyverse.backend.domain.notification.controller;

import com.jinyverse.backend.domain.notification.dto.NotificationTemplateRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationTemplateResponseDto;
import com.jinyverse.backend.domain.notification.service.NotificationTemplateService;
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
@RequestMapping("/api/notification-templates")
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateService templateService;

    @PostMapping
    public ResponseEntity<NotificationTemplateResponseDto> create(
            @Valid @RequestBody NotificationTemplateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.create(dto));
    }

    @GetMapping
    public ResponseEntity<Page<NotificationTemplateResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable) {
        return ResponseEntity.ok(templateService.getAll(filter, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationTemplateResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationTemplateResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody NotificationTemplateRequestDto dto) {
        return ResponseEntity.ok(templateService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
