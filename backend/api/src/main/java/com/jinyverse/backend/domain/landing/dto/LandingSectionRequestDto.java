package com.jinyverse.backend.domain.landing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingSectionRequestDto {

    @NotBlank(message = "섹션 타입은 필수입니다")
    private String type;

    private String title;

    private String description;

    private UUID boardId;

    private Boolean isActive;

    private Integer order;

    private Map<String, Object> extraConfig;
}
