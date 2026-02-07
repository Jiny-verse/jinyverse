package com.jinyverse.backend.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class LoginRequestDto {

    @NotBlank(message = "사용자명은 필수입니다")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 100)
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).*$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"
    )
    private String password;
}
