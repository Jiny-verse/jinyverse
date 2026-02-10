package com.jinyverse.backend.domain.tag.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.tag.dto.TagRequestDto;
import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import com.jinyverse.backend.domain.tag.service.TagService;
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
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    public ResponseEntity<TagResponseDto> create(@Valid @RequestBody TagRequestDto requestDto) {
        TagResponseDto response = tagService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TagResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel
    ) {
        Page<TagResponseDto> responses =
                tagService.getAll(filter, pageable, RequestContext.fromChannelHeader(channel));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponseDto> getById(@PathVariable UUID id) {
        TagResponseDto response = tagService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<TagResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody TagRequestDto requestDto) {
        TagResponseDto response = tagService.update(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
