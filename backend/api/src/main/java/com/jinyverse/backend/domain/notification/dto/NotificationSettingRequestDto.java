package com.jinyverse.backend.domain.notification.dto;

import lombok.*;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingRequestDto {
    private Boolean systemEnabled;
    private Boolean emailEnabled;
    private String emailOverride;
    private Map<String, Boolean> typeSettings;
}
