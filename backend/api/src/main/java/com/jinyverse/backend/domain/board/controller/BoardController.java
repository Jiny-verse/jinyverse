package com.jinyverse.backend.domain.board.controller;

import com.jinyverse.backend.domain.board.dto.BoardRequestDto;
import com.jinyverse.backend.domain.board.dto.BoardResponseDto;
import com.jinyverse.backend.domain.board.service.BoardService;
import com.jinyverse.backend.domain.common.util.RequestContext;
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
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponseDto> create(
            @Valid @RequestBody BoardRequestDto requestDto,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        BoardResponseDto response = boardService.create(requestDto, RequestContext.fromHeaders(channel, role));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<BoardResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        Page<BoardResponseDto> responses =
                boardService.getAll(filter, pageable, RequestContext.fromHeaders(channel, role));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        long count = boardService.count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardResponseDto> getById(@PathVariable UUID id) {
        BoardResponseDto response = boardService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<BoardResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody BoardRequestDto requestDto,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        BoardResponseDto response = boardService.update(id, requestDto, RequestContext.fromHeaders(channel, role));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        boardService.delete(id, RequestContext.fromHeaders(channel, role));
        return ResponseEntity.noContent().build();
    }
}
