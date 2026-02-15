package com.jinyverse.backend.domain.audit.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinyverse.backend.domain.audit.dto.AuditLogRequestDto;
import com.jinyverse.backend.domain.audit.service.AuditLogService;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogHelper {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    /** 표준 감사 로그 (targetId 있는 경우: USER, BOARD, TOPIC, COMMENT, MENU, TAG, AUTH_EVENT) */
    public void log(String targetType, UUID targetId, String action, Object before, Object after) {
        logInternal(targetType, targetId, action, before, after, null);
    }

    /** metadata 필요한 경우 (CODE, SYSTEM_SETTING) */
    public void log(String targetType, String action, Object before, Object after, String metadata) {
        logInternal(targetType, null, action, before, after, metadata);
    }

    private void logInternal(String targetType, UUID targetId, String action,
                             Object before, Object after, String metadata) {
        try {
            RequestContext ctx = RequestContextHolder.get();
            UUID actorId = ctx != null ? ctx.getCurrentUserId() : null;
            String ipAddress = ctx != null ? ctx.getIpAddress() : null;
            String beforeJson = before != null ? objectMapper.writeValueAsString(before) : null;
            String afterJson  = after  != null ? objectMapper.writeValueAsString(after)  : null;

            AuditLogRequestDto.AuditLogRequestDtoBuilder builder = AuditLogRequestDto.builder()
                    .targetType(targetType)
                    .targetId(targetId)
                    .action(action)
                    .actorUserId(actorId)
                    .ipAddress(ipAddress)
                    .beforeData(beforeJson)
                    .afterData(afterJson);

            if (metadata != null) {
                builder.metadata(metadata);
            }

            auditLogService.create(builder.build());
        } catch (Exception e) {
            log.warn("Failed to create audit log for {}: {}", targetType, e.getMessage());
        }
    }
}
