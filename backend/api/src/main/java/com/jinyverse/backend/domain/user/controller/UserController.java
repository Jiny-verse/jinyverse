package com.jinyverse.backend.domain.user.controller;

import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import com.jinyverse.backend.domain.user.dto.UserRequestDto;
import com.jinyverse.backend.domain.user.dto.UserResponseDto;
import com.jinyverse.backend.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponseDto> create(@Valid @RequestBody UserRequestDto requestDto) {
        UserResponseDto response = userService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDto>> getAll(Pageable pageable) {
        Page<UserResponseDto> responses =
                userService.getAll(pageable, RequestContextHolder.get());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getById(@PathVariable UUID id) {
        UserResponseDto response = userService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserRequestDto requestDto) {
        UserResponseDto response = userService.update(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
