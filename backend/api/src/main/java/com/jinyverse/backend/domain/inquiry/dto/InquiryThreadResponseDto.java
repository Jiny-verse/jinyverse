package com.jinyverse.backend.domain.inquiry.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryThreadResponseDto {
    private UUID id;
    private UUID inquiryId;
    private UUID authorId;
    private String authorEmail;
    private String authorName;
    private String typeCode;
    private String content;
    private boolean emailSent;
    private LocalDateTime createdAt;
}
