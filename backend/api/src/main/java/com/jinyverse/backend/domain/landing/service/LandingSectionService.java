package com.jinyverse.backend.domain.landing.service;

import com.jinyverse.backend.domain.landing.dto.LandingCtaResponseDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingSectionResponseDto;
import com.jinyverse.backend.domain.landing.entity.LandingSection;
import com.jinyverse.backend.domain.landing.entity.LandingSectionFile;
import com.jinyverse.backend.domain.landing.repository.LandingSectionFileRepository;
import com.jinyverse.backend.domain.landing.repository.LandingSectionRepository;
import com.jinyverse.backend.exception.ForbiddenException;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.Channel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LandingSectionService {

    private final LandingSectionRepository sectionRepository;
    private final LandingSectionFileRepository sectionFileRepository;

    /** 공개 API: 활성화된 섹션 목록 (CTA 포함) */
    public List<LandingSectionResponseDto> getActiveSections() {
        return sectionRepository.findAllByIsActiveTrueAndDeletedAtIsNullOrderByOrderAsc()
                .stream()
                .map(s -> s.toResponseDto(
                        s.getCtas().stream()
                                .filter(c -> c.getDeletedAt() == null && Boolean.TRUE.equals(c.getIsActive()))
                                .map(c -> c.toResponseDto())
                                .toList()
                ))
                .toList();
    }

    /** 관리자 API: 전체 섹션 목록 (비활성 포함) */
    public List<LandingSectionResponseDto> getAllSections(RequestContext ctx) {
        requireAdmin(ctx);
        return sectionRepository.findAllByDeletedAtIsNullOrderByOrderAsc()
                .stream()
                .map(s -> s.toResponseDto(
                        s.getCtas().stream()
                                .filter(c -> c.getDeletedAt() == null)
                                .map(c -> c.toResponseDto())
                                .toList()
                ))
                .toList();
    }

    @Transactional
    public LandingSectionResponseDto create(LandingSectionRequestDto dto, RequestContext ctx) {
        requireAdmin(ctx);
        LandingSection saved = sectionRepository.save(LandingSection.fromRequestDto(dto));
        return saved.toResponseDto(List.of());
    }

    @Transactional
    public LandingSectionResponseDto update(UUID id, LandingSectionRequestDto dto, RequestContext ctx) {
        requireAdmin(ctx);
        LandingSection section = findActive(id);
        section.applyUpdate(dto);
        LandingSection saved = sectionRepository.save(section);
        List<LandingCtaResponseDto> ctas = saved.getCtas().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(c -> c.toResponseDto())
                .toList();
        return saved.toResponseDto(ctas);
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        requireAdmin(ctx);
        LandingSection section = findActive(id);
        section.setDeletedAt(LocalDateTime.now());
        sectionRepository.save(section);
    }

    @Transactional
    public LandingSectionResponseDto addFile(UUID sectionId, UUID fileId, boolean isMain, RequestContext ctx) {
        requireAdmin(ctx);
        LandingSection section = findActive(sectionId);
        int order = section.getFiles().size();
        LandingSectionFile rel = LandingSectionFile.builder()
                .sectionId(sectionId)
                .fileId(fileId)
                .order(order)
                .isMain(isMain)
                .build();
        sectionFileRepository.save(rel);
        // reload
        LandingSection reloaded = findActive(sectionId);
        List<LandingCtaResponseDto> ctas = reloaded.getCtas().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(c -> c.toResponseDto())
                .toList();
        return reloaded.toResponseDto(ctas);
    }

    @Transactional
    public void removeFile(UUID sectionId, UUID fileId, RequestContext ctx) {
        requireAdmin(ctx);
        findActive(sectionId);
        sectionFileRepository.deleteBySectionIdAndFileId(sectionId, fileId);
    }

    private LandingSection findActive(UUID id) {
        return sectionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandingSection", id));
    }

    private void requireAdmin(RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Landing management requires ADMIN on INTERNAL channel");
        }
    }
}
