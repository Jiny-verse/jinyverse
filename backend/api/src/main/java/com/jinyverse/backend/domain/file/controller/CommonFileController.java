package com.jinyverse.backend.domain.file.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.file.dto.CommonFileRequestDto;
import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import com.jinyverse.backend.domain.file.service.CommonFileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class CommonFileController {

    private final CommonFileService commonFileService;

    @PostMapping
    public ResponseEntity<CommonFileResponseDto> create(@Valid @RequestBody CommonFileRequestDto requestDto) {
        CommonFileResponseDto response = commonFileService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommonFileResponseDto>> getAll(
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel
    ) {
        Page<CommonFileResponseDto> responses =
                commonFileService.getAll(pageable, RequestContext.fromChannelHeader(channel));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonFileResponseDto> getById(@PathVariable UUID id) {
        CommonFileResponseDto response = commonFileService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommonFileResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody CommonFileRequestDto requestDto) {
        CommonFileResponseDto response = commonFileService.update(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        commonFileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
