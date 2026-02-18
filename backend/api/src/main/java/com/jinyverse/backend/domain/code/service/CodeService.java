package com.jinyverse.backend.domain.code.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.code.dto.CodeRequestDto;
import com.jinyverse.backend.domain.code.dto.CodeResponseDto;
import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.code.repository.CodeCategoryRepository;
import com.jinyverse.backend.domain.code.repository.CodeRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeService {

    private final CodeRepository codeRepository;
    private final CodeCategoryRepository codeCategoryRepository;
    private final AuditLogHelper auditLogHelper;

    @Transactional
    public CodeResponseDto create(CodeRequestDto requestDto) {
        checkNotSealed(requestDto.getCategoryCode());
        Code code = Code.fromRequestDto(requestDto);
        Code saved = codeRepository.save(code);
        CodeResponseDto dto = saved.toResponseDto();
        auditLogHelper.log("CODE", "CREATE", null, dto, "{\"codeKey\":\"" + saved.getCategoryCode() + ":" + saved.getCode() + "\"}");
        return dto;
    }

    public CodeResponseDto getByCategoryCodeAndCode(String categoryCode, String code) {
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException(
                        "Code not found with categoryCode: " + categoryCode + ", code: " + code));
        return codeEntity.toResponseDto();
    }

    public Page<CodeResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return codeRepository.findAll(spec(ctx, filter), pageable).map(Code::toResponseDto);
    }

    @Transactional
    public CodeResponseDto update(String categoryCode, String code, CodeRequestDto requestDto) {
        checkNotSealed(categoryCode);
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException(
                        "Code not found with categoryCode: " + categoryCode + ", code: " + code));

        CodeResponseDto before = codeEntity.toResponseDto();
        codeEntity.applyUpdate(requestDto);
        Code updated = codeRepository.save(codeEntity);
        CodeResponseDto after = updated.toResponseDto();
        auditLogHelper.log("CODE", "UPDATE", before, after, "{\"codeKey\":\"" + categoryCode + ":" + code + "\"}");
        return after;
    }

    @Transactional
    public void delete(String categoryCode, String code) {
        checkNotSealed(categoryCode);
        Code codeEntity = codeRepository.findByCategoryCodeAndCodeAndDeletedAtIsNull(categoryCode, code)
                .orElseThrow(() -> new RuntimeException(
                        "Code not found with categoryCode: " + categoryCode + ", code: " + code));

        CodeResponseDto before = codeEntity.toResponseDto();
        codeEntity.setDeletedAt(LocalDateTime.now());
        codeRepository.save(codeEntity);
        auditLogHelper.log("CODE", "DELETE", before, null, "{\"codeKey\":\"" + categoryCode + ":" + code + "\"}");
    }

    private void checkNotSealed(String categoryCode) {
        CodeCategory category = codeCategoryRepository.findByCodeAndDeletedAtIsNull(categoryCode)
                .orElseThrow(() -> new RuntimeException("CodeCategory not found: " + categoryCode));
        if (Boolean.TRUE.equals(category.getIsSealed())) {
            throw new BadRequestException("잠긴 분류에는 코드를 추가/수정/삭제할 수 없습니다.");
        }
    }

    /**
     * 삭제 여부 + 쿼리 파라미터 필터: categoryCode, q(코드·이름·설명 검색)
     */
    private Specification<Code> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q",
                        new String[] { "categoryCode", "code", "name", "description" }));
    }
}
