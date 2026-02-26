package com.jinyverse.backend.domain.notification.dto;

import lombok.*;

import java.util.Map;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingResponseDto {
    private UUID id;
    private UUID userId;
    private Boolean systemEnabled;
    private Boolean emailEnabled;
    private String emailOverride;
    private Map<String, Boolean> typeSettings;
}
