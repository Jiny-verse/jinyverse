package com.jinyverse.backend.domain.code.service;

import com.jinyverse.backend.domain.code.dto.CodeCategoryRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeCategoryResponseDto;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.code.repository.CodeCategoryRepository;
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
public class CodeCategoryService {

    private final CodeCategoryRepository codeCategoryRepository;

    @Transactional
    public CodeCategoryResponseDto create(CodeCategoryRequestDto requestDto) {
        CodeCategory codeCategory = CodeCategory.fromRequestDto(requestDto);
        CodeCategory saved = codeCategoryRepository.save(codeCategory);
        return saved.toResponseDto();
    }

    public CodeCategoryResponseDto getByCode(String code) {
        CodeCategory codeCategory = codeCategoryRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("CodeCategory not found with code: " + code));
        return codeCategory.toResponseDto();
    }

    public Page<CodeCategoryResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return codeCategoryRepository.findAll(spec(ctx), pageable).map(CodeCategory::toResponseDto);
    }

    @Transactional
    public CodeCategoryResponseDto update(String code, CodeCategoryRequestDto requestDto) {
        CodeCategory codeCategory = codeCategoryRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("CodeCategory not found with code: " + code));

        codeCategory.applyUpdate(requestDto);
        CodeCategory updated = codeCategoryRepository.save(codeCategory);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(String code) {
        CodeCategory codeCategory = codeCategoryRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("CodeCategory not found with code: " + code));

        codeCategory.setDeletedAt(LocalDateTime.now());
        codeCategoryRepository.save(codeCategory);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<CodeCategory> spec(RequestContext ctx) {
        return CommonSpecifications.notDeleted();
    }
}
