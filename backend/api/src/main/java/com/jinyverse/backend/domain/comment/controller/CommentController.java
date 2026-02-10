package com.jinyverse.backend.domain.comment.controller;

import com.jinyverse.backend.domain.comment.dto.CommentRequestDto;
import com.jinyverse.backend.domain.comment.dto.CommentResponseDto;
import com.jinyverse.backend.domain.comment.service.CommentService;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    private RequestContext resolveContext(String channel, String role) {
        RequestContext ctx = RequestContextHolder.get();
        return ctx != null ? ctx : RequestContext.fromHeaders(channel, role);
    }

    @PostMapping
    public ResponseEntity<CommentResponseDto> create(
            @Valid @RequestBody CommentRequestDto requestDto,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        CommentResponseDto response = commentService.create(requestDto, resolveContext(channel, role));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        Page<CommentResponseDto> responses =
                commentService.getAll(filter, pageable, resolveContext(channel, role));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponseDto> getById(@PathVariable UUID id) {
        CommentResponseDto response = commentService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<CommentResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequestDto requestDto,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        CommentResponseDto response = commentService.update(id, requestDto, resolveContext(channel, role));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        commentService.delete(id, resolveContext(channel, role));
        return ResponseEntity.noContent().build();
    }
}
