package com.jinyverse.backend.domain.user.dto;

import jakarta.validation.constraints.Email;
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
public class UserRequestDto {

    /** 권한 분류 코드 */
    @Size(max = 40, message = "권한 분류 코드는 40자 이하여야 합니다")
    private String roleCategoryCode;

    /** 권한 코드 값 */
    @Size(max = 40, message = "권한 코드는 40자 이하여야 합니다")
    private String role;

    /** 로그인 아이디 */
    @NotBlank(message = "사용자명은 필수입니다")
    @Size(max = 50, message = "사용자명은 50자 이하여야 합니다")
    private String username;

    /** 비밀번호 해시 */
    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(max = 256, message = "비밀번호는 256자 이하여야 합니다")
    private String password;

    /** 이메일 */
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 256, message = "이메일은 256자 이하여야 합니다")
    private String email;

    /** 사용자 실명 */
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 20, message = "이름은 20자 이하여야 합니다")
    private String name;

    /** 닉네임 */
    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 20, message = "닉네임은 20자 이하여야 합니다")
    private String nickname;

    /** 계정 활성 여부 */
    private Boolean isActive;

    /** 계정 잠금 여부 */
    private Boolean isLocked;
}
