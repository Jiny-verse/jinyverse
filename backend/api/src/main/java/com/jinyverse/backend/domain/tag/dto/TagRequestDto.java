package com.jinyverse.backend.domain.tag.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequestDto {

    /** 태그 명 */
    @NotBlank(message = "태그명은 필수입니다")
    @Size(max = 50, message = "태그명은 50자 이하여야 합니다")
    private String name;

    /** 태그 설명 */
    private String description;
}
