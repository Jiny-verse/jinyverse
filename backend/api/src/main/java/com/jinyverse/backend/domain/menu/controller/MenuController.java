package com.jinyverse.backend.domain.menu.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import com.jinyverse.backend.domain.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuResponseDto> create(@Valid @RequestBody MenuRequestDto requestDto) {
        MenuResponseDto response = menuService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<MenuResponseDto>> getAll(
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel
    ) {
        Page<MenuResponseDto> responses =
                menuService.getAll(pageable, RequestContext.fromChannelHeader(channel));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{code}")
    public ResponseEntity<MenuResponseDto> getByCode(@PathVariable String code) {
        MenuResponseDto response = menuService.getByCode(code);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{code}")
    public ResponseEntity<MenuResponseDto> update(
            @PathVariable String code,
            @Valid @RequestBody MenuRequestDto requestDto) {
        MenuResponseDto response = menuService.update(code, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        menuService.delete(code);
        return ResponseEntity.noContent().build();
    }
}
