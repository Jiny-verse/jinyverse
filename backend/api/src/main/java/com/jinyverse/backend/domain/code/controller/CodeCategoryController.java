package com.jinyverse.backend.domain.code.controller;

import com.jinyverse.backend.domain.code.dto.CodeCategoryRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeCategoryResponseDto;
import com.jinyverse.backend.domain.code.service.CodeCategoryService;
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
@RequestMapping("/api/code-categories")
@RequiredArgsConstructor
public class CodeCategoryController {

    private final CodeCategoryService codeCategoryService;

    @PostMapping
    public ResponseEntity<CodeCategoryResponseDto> create(@Valid @RequestBody CodeCategoryRequestDto requestDto) {
        CodeCategoryResponseDto response = codeCategoryService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CodeCategoryResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            RequestContext ctx
    ) {
        Page<CodeCategoryResponseDto> responses = codeCategoryService.getAll(filter, pageable, ctx);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{code}")
    public ResponseEntity<CodeCategoryResponseDto> getByCode(@PathVariable String code) {
        CodeCategoryResponseDto response = codeCategoryService.getByCode(code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{code}/update")
    public ResponseEntity<CodeCategoryResponseDto> update(
            @PathVariable String code,
            @Valid @RequestBody CodeCategoryRequestDto requestDto) {
        CodeCategoryResponseDto response = codeCategoryService.update(code, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        codeCategoryService.delete(code);
        return ResponseEntity.noContent().build();
    }
}
