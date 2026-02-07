package com.jinyverse.backend.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequestDto {

    @NotBlank(message = "refreshToken은 필수입니다")
    private String refreshToken;
}
