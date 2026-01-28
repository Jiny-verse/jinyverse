package com.jinyverse.backend.domain.audit.service;

import com.jinyverse.backend.domain.audit.dto.AuditLogRequestDto;
import com.jinyverse.backend.domain.audit.dto.AuditLogResponseDto;
import com.jinyverse.backend.domain.audit.entity.AuditLog;
import com.jinyverse.backend.domain.audit.repository.AuditLogRepository;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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

    public Page<AuditLogResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return auditLogRepository.findAll(spec(ctx), pageable).map(AuditLog::toResponseDto);
    }

    /**
     * 권한 및 채널에 따른 강제 조건 (Audit은 INTERNAL만 조회 가능)
     */
    private Specification<AuditLog> spec(RequestContext ctx) {
        // Audit 로그는 INTERNAL 채널에서만 조회 가능하도록 제한
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            return (root, query, cb) -> cb.disjunction(); // 항상 false
        }
        return (root, query, cb) -> cb.conjunction();
    }
}
