package com.jinyverse.backend.domain.landing.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.landing.dto.LandingCtaRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingCtaResponseDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionResponseDto;
import com.jinyverse.backend.domain.landing.service.LandingCtaService;
import com.jinyverse.backend.domain.landing.service.LandingSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/landing")
@RequiredArgsConstructor
public class AdminLandingController {

    private final LandingSectionService landingSectionService;
    private final LandingCtaService landingCtaService;

    @GetMapping("/sections")
    public ResponseEntity<List<LandingSectionResponseDto>> getAllSections(RequestContext ctx) {
        return ResponseEntity.ok(landingSectionService.getAllSections(ctx));
    }

    @PostMapping("/sections")
    public ResponseEntity<LandingSectionResponseDto> createSection(
            @Valid @RequestBody LandingSectionRequestDto dto,
            RequestContext ctx
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(landingSectionService.create(dto, ctx));
    }

    @PostMapping("/sections/{id}")
    public ResponseEntity<LandingSectionResponseDto> updateSection(
            @PathVariable UUID id,
            @Valid @RequestBody LandingSectionRequestDto dto,
            RequestContext ctx
    ) {
        return ResponseEntity.ok(landingSectionService.update(id, dto, ctx));
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID id, RequestContext ctx) {
        landingSectionService.delete(id, ctx);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{id}/ctas")
    public ResponseEntity<LandingCtaResponseDto> createCta(
            @PathVariable UUID id,
            @Valid @RequestBody LandingCtaRequestDto dto,
            RequestContext ctx
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(landingCtaService.create(id, dto, ctx));
    }

    @PostMapping("/ctas/{id}")
    public ResponseEntity<LandingCtaResponseDto> updateCta(
            @PathVariable UUID id,
            @Valid @RequestBody LandingCtaRequestDto dto,
            RequestContext ctx
    ) {
        return ResponseEntity.ok(landingCtaService.update(id, dto, ctx));
    }

    @DeleteMapping("/ctas/{id}")
    public ResponseEntity<Void> deleteCta(@PathVariable UUID id, RequestContext ctx) {
        landingCtaService.delete(id, ctx);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{id}/files")
    public ResponseEntity<LandingSectionResponseDto> addFile(
            @PathVariable UUID id,
            @RequestParam UUID fileId,
            @RequestParam(defaultValue = "false") boolean isMain,
            RequestContext ctx
    ) {
        return ResponseEntity.ok(landingSectionService.addFile(id, fileId, isMain, ctx));
    }

    @DeleteMapping("/sections/{id}/files/{fileId}")
    public ResponseEntity<Void> removeFile(
            @PathVariable UUID id,
            @PathVariable UUID fileId,
            RequestContext ctx
    ) {
        landingSectionService.removeFile(id, fileId, ctx);
        return ResponseEntity.noContent().build();
    }
}
