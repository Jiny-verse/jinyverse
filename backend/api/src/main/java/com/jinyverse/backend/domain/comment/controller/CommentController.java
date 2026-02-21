package com.jinyverse.backend.domain.comment.controller;

import com.jinyverse.backend.domain.comment.dto.CommentRequestDto;
import com.jinyverse.backend.domain.comment.dto.CommentResponseDto;
import com.jinyverse.backend.domain.comment.service.CommentService;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.CreateGroup;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponseDto> create(
            @Validated(CreateGroup.class) @RequestBody CommentRequestDto requestDto,
            RequestContext ctx
    ) {
        CommentResponseDto response = commentService.create(requestDto, ctx);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            RequestContext ctx
    ) {
        Page<CommentResponseDto> responses = commentService.getAll(filter, pageable, ctx);
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
            RequestContext ctx
    ) {
        CommentResponseDto response = commentService.update(id, requestDto, ctx);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            RequestContext ctx
    ) {
        commentService.delete(id, ctx);
        return ResponseEntity.noContent().build();
    }
}
