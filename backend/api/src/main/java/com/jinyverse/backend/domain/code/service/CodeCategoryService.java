package com.jinyverse.backend.domain.code.service;

import com.jinyverse.backend.domain.code.dto.CodeCategoryRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeCategoryResponseDto;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.code.repository.CodeCategoryRepository;
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
import java.util.List;
import java.util.Map;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeCategoryService {

    private final CodeCategoryRepository codeCategoryRepository;
    private final CodeRepository codeRepository;

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

    public Page<CodeCategoryResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return codeCategoryRepository.findAll(spec(ctx, filter), pageable).map(CodeCategory::toResponseDto);
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

        LocalDateTime now = LocalDateTime.now();
        List<Code> codes = codeRepository.findByCategoryCodeAndDeletedAtIsNull(code);
        codes.forEach(c -> c.setDeletedAt(now));
        codeRepository.saveAll(codes);
        codeCategory.setDeletedAt(now);
        codeCategoryRepository.save(codeCategory);
    }

    /**
     * 삭제 여부 + 쿼리 파라미터 필터: q(코드·이름·설명 검색)
     */
    private Specification<CodeCategory> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"code", "name", "description"})
        );
    }
}
