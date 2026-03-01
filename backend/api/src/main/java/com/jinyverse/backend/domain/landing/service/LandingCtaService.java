package com.jinyverse.backend.domain.landing.service;

import com.jinyverse.backend.domain.landing.dto.LandingCtaRequestDto;
import com.jinyverse.backend.domain.landing.dto.LandingCtaResponseDto;
import com.jinyverse.backend.domain.landing.entity.LandingCta;
import com.jinyverse.backend.domain.landing.repository.LandingCtaRepository;
import com.jinyverse.backend.domain.landing.repository.LandingSectionRepository;
import com.jinyverse.backend.exception.ForbiddenException;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.Channel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LandingCtaService {

    private final LandingCtaRepository ctaRepository;
    private final LandingSectionRepository sectionRepository;

    @Transactional
    public LandingCtaResponseDto create(UUID sectionId, LandingCtaRequestDto dto, RequestContext ctx) {
        requireAdmin(ctx);
        sectionRepository.findByIdAndDeletedAtIsNull(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("LandingSection", sectionId));
        LandingCta saved = ctaRepository.save(LandingCta.fromRequestDto(sectionId, dto));
        return saved.toResponseDto();
    }

    @Transactional
    public LandingCtaResponseDto update(UUID id, LandingCtaRequestDto dto, RequestContext ctx) {
        requireAdmin(ctx);
        LandingCta cta = findActive(id);
        cta.applyUpdate(dto);
        return ctaRepository.save(cta).toResponseDto();
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        requireAdmin(ctx);
        LandingCta cta = findActive(id);
        cta.setDeletedAt(LocalDateTime.now());
        ctaRepository.save(cta);
    }

    private LandingCta findActive(UUID id) {
        return ctaRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandingCta", id));
    }

    private void requireAdmin(RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Landing CTA management requires ADMIN on INTERNAL channel");
        }
    }
}
