package com.jinyverse.backend.domain.audit.controller;

import com.jinyverse.backend.domain.audit.dto.AuditLogRequestDto;
import com.jinyverse.backend.domain.audit.dto.AuditLogResponseDto;
import com.jinyverse.backend.domain.audit.service.AuditLogService;
import com.jinyverse.backend.domain.common.util.RequestContext;
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
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping
    public ResponseEntity<AuditLogResponseDto> create(@Valid @RequestBody AuditLogRequestDto requestDto) {
        AuditLogResponseDto response = auditLogService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDto>> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel
    ) {
        Page<AuditLogResponseDto> responses =
                auditLogService.getAll(pageable, RequestContext.fromChannelHeader(channel));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponseDto> getById(@PathVariable UUID id) {
        AuditLogResponseDto response = auditLogService.getById(id);
        return ResponseEntity.ok(response);
    }
}
