package com.jinyverse.backend.domain.code.service;

import com.jinyverse.backend.domain.code.dto.CodeRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeResponseDto;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.repository.CodeRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeService {

    private final CodeRepository codeRepository;

    @Transactional
    public CodeResponseDto create(CodeRequestDto requestDto) {
        Code code = Code.fromRequestDto(requestDto);
        Code saved = codeRepository.save(code);
        return saved.toResponseDto();
    }

    public CodeResponseDto getByCategoryCodeAndCode(String categoryCode, String code) {
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException("Code not found with categoryCode: " + categoryCode + ", code: " + code));
        return codeEntity.toResponseDto();
    }

    public Page<CodeResponseDto> getAll(String categoryCode, Pageable pageable, RequestContext ctx) {
        Specification<Code> spec = spec(ctx);
        if (categoryCode != null) {
            spec = spec.and(CommonSpecifications.eqIfPresent("categoryCode", categoryCode));
        }
        
        return codeRepository.findAll(spec, pageable).map(Code::toResponseDto);
    }

    @Transactional
    public CodeResponseDto update(String categoryCode, String code, CodeRequestDto requestDto) {
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException("Code not found with categoryCode: " + categoryCode + ", code: " + code));

        codeEntity.applyUpdate(requestDto);
        Code updated = codeRepository.save(codeEntity);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(String categoryCode, String code) {
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException("Code not found with categoryCode: " + categoryCode + ", code: " + code));

        codeEntity.setDeletedAt(LocalDateTime.now());
        codeRepository.save(codeEntity);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Code> spec(RequestContext ctx) {
        return CommonSpecifications.notDeleted();
    }
}
