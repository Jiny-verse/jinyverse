package com.jinyverse.backend.domain.landing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingSectionResponseDto {

    private UUID id;
    private String typeCategoryCode;
    private String type;
    private String title;
    private String description;
    private UUID boardId;
    private Boolean isActive;
    private Integer order;
    private Map<String, Object> extraConfig;
    private List<LandingCtaResponseDto> ctas;
    private List<UUID> fileIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
