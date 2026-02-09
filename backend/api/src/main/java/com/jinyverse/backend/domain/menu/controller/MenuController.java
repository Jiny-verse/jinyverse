package com.jinyverse.backend.domain.menu.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.CreateGroup;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResolveResponseDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import com.jinyverse.backend.domain.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuResponseDto> create(
            @Validated(CreateGroup.class) @RequestBody MenuRequestDto requestDto) {
        MenuResponseDto response = menuService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<MenuResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        Page<MenuResponseDto> responses =
                menuService.getAll(filter, pageable, RequestContext.fromHeaders(channel, role));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{code}")
    public ResponseEntity<MenuResponseDto> getByCode(@PathVariable String code) {
        MenuResponseDto response = menuService.getByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}/resolve")
    public ResponseEntity<MenuResolveResponseDto> resolve(@PathVariable String code) {
        return menuService.resolve(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{code}")
    public ResponseEntity<MenuResponseDto> update(
            @PathVariable String code,
            @Valid @RequestBody MenuRequestDto requestDto) {
        if (requestDto.getCode() == null || requestDto.getCode().isBlank()) {
            requestDto.setCode(code);
        }
        MenuResponseDto response = menuService.update(code, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        menuService.delete(code);
        return ResponseEntity.noContent().build();
    }
}
