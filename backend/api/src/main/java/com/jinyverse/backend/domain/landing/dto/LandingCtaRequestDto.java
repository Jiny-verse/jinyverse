package com.jinyverse.backend.domain.landing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingCtaRequestDto {

    private String type;

    private String label;

    @NotBlank(message = "링크 주소는 필수입니다")
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
}
