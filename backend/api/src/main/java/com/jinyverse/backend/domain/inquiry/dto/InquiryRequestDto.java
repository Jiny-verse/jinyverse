package com.jinyverse.backend.domain.inquiry.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryRequestDto {

    @Email
    private String guestEmail;

    @NotBlank
    @Size(max = 40)
    private String categoryCode;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String content;
}
