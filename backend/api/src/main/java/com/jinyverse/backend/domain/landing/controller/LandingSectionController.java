package com.jinyverse.backend.domain.landing.controller;

import com.jinyverse.backend.domain.landing.dto.LandingSectionResponseDto;
import com.jinyverse.backend.domain.landing.service.LandingSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/landing")
@RequiredArgsConstructor
public class LandingSectionController {

    private final LandingSectionService landingSectionService;

    /** 공개 API: 활성 섹션 목록 (CTA 포함) */
    @GetMapping("/sections")
    public ResponseEntity<List<LandingSectionResponseDto>> getActiveSections() {
        return ResponseEntity.ok(landingSectionService.getActiveSections());
    }
}
