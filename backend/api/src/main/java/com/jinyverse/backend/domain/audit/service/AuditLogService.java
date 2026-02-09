package com.jinyverse.backend.domain.audit.service;

import com.jinyverse.backend.domain.audit.dto.AuditLogRequestDto;
import com.jinyverse.backend.domain.audit.dto.AuditLogResponseDto;
import com.jinyverse.backend.domain.audit.entity.AuditLog;
import com.jinyverse.backend.domain.audit.repository.AuditLogRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLogResponseDto create(AuditLogRequestDto requestDto) {
        AuditLog auditLog = AuditLog.fromRequestDto(requestDto);
        AuditLog saved = auditLogRepository.save(auditLog);
        return saved.toResponseDto();
    }

    public AuditLogResponseDto getById(UUID id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AuditLog not found with id: " + id));
        return auditLog.toResponseDto();
    }

    public Page<AuditLogResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return auditLogRepository.findAll(spec(ctx, filter), pageable).map(AuditLog::toResponseDto);
    }

    /**
     * 권한·채널(INTERNAL만 조회) + 쿼리 파라미터 필터: q(targetType·action 검색), targetId, actorUserId 등
     */
    private Specification<AuditLog> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<AuditLog> base = (root, query, cb) -> cb.conjunction();
        // Audit 로그는 INTERNAL 채널에서만 조회 가능
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            base = (root, query, cb) -> cb.disjunction();
        }
        return CommonSpecifications.and(
                base,
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"targetType", "action"})
        );
    }
}
