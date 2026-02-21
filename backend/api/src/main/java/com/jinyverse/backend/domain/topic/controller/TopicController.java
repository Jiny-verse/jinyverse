package com.jinyverse.backend.domain.topic.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.CreateGroup;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<TopicResponseDto> create(
            @Validated(CreateGroup.class) @RequestBody TopicRequestDto requestDto,
            RequestContext ctx) {
        TopicResponseDto response = topicService.create(requestDto, ctx);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TopicResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            @PageableDefault(sort = { "isPinned", "createdAt" }, direction = Sort.Direction.DESC) Pageable pageable,
            RequestContext ctx) {
        Page<TopicResponseDto> responses = topicService.getAll(filter, pageable, ctx);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        long count = topicService.count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponseDto> getById(
            @PathVariable UUID id,
            RequestContext ctx) {
        TopicResponseDto response = topicService.getById(id, ctx);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<TopicResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody TopicRequestDto requestDto,
            RequestContext ctx) {
        TopicResponseDto response = topicService.update(id, requestDto, ctx);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            RequestContext ctx) {
        topicService.delete(id, ctx);
        return ResponseEntity.noContent().build();
    }
}
