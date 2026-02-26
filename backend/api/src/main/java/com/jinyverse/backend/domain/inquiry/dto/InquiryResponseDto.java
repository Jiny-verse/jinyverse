package com.jinyverse.backend.domain.inquiry.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryResponseDto {
    private UUID id;
    private String ticketNo;
    private UUID userId;
    private String guestEmail;
    private String categoryCode;
    private String title;
    private String statusCode;
    private String priorityCode;
    private UUID assigneeId;
    private String assigneeName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<InquiryThreadResponseDto> threads;

    public InquiryResponseDto withThreads(List<InquiryThreadResponseDto> threads) {
        return InquiryResponseDto.builder()
                .id(this.id)
                .ticketNo(this.ticketNo)
                .userId(this.userId)
                .guestEmail(this.guestEmail)
                .categoryCode(this.categoryCode)
                .title(this.title)
                .statusCode(this.statusCode)
                .priorityCode(this.priorityCode)
                .assigneeId(this.assigneeId)
                .assigneeName(this.assigneeName)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .threads(threads)
                .build();
    }
}
