package com.jinyverse.backend.domain.code.controller;

import com.jinyverse.backend.domain.code.dto.CodeRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeResponseDto;
import com.jinyverse.backend.domain.code.service.CodeService;
import com.jinyverse.backend.domain.common.util.RequestContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/codes")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @PostMapping
    public ResponseEntity<CodeResponseDto> create(@Valid @RequestBody CodeRequestDto requestDto) {
        CodeResponseDto response = codeService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CodeResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            RequestContext ctx
    ) {
        Page<CodeResponseDto> responses = codeService.getAll(filter, pageable, ctx);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{categoryCode}/{code}")
    public ResponseEntity<CodeResponseDto> getByCategoryCodeAndCode(
            @PathVariable String categoryCode,
            @PathVariable String code) {
        CodeResponseDto response = codeService.getByCategoryCodeAndCode(categoryCode, code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{categoryCode}/{code}/update")
    public ResponseEntity<CodeResponseDto> update(
            @PathVariable String categoryCode,
            @PathVariable String code,
            @Valid @RequestBody CodeRequestDto requestDto) {
        CodeResponseDto response = codeService.update(categoryCode, code, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryCode}/{code}")
    public ResponseEntity<Void> delete(@PathVariable String categoryCode, @PathVariable String code) {
        codeService.delete(categoryCode, code);
        return ResponseEntity.noContent().build();
    }
}
