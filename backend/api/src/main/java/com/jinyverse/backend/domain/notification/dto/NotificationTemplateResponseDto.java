package com.jinyverse.backend.domain.notification.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateResponseDto {
    private UUID id;
    private String name;
    private String channel;
    private String emailSubject;
    private String body;
    private List<String> variables;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
