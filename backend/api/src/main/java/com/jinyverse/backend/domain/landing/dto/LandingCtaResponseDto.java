package com.jinyverse.backend.domain.landing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingCtaResponseDto {

    private UUID id;
    private UUID sectionId;
    private String typeCategoryCode;
    private String type;
    private String label;
    private String href;
    private String className;
    private BigDecimal positionTop;
    private BigDecimal positionLeft;
    private BigDecimal positionBottom;
    private BigDecimal positionRight;
    private String positionTransform;
    private UUID imageFileId;
    private Integer order;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
