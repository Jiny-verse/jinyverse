package com.jinyverse.backend.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryThreadRequestDto {

    @NotBlank
    @Size(max = 40)
    private String typeCode;

    @NotBlank
    private String content;

    private boolean sendEmail;
}
