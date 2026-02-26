package com.jinyverse.backend.domain.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateRequestDto {

    @NotBlank
    @Size(max = 255)
    private String name;

    /** 발송 채널: system / email / both */
    @NotBlank
    @Size(max = 40)
    private String channel;

    @Size(max = 255)
    private String emailSubject;

    @NotBlank
    private String body;

    private List<String> variables;

    private String description;
}
