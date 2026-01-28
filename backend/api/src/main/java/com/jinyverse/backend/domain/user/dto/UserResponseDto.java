package com.jinyverse.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    /** 사용자 고유 ID */
    private UUID id;
    /** 권한 분류 코드 */
    private String roleCategoryCode;
    /** 권한 코드 값 */
    private String role;
    /** 로그인 아이디 */
    private String username;
    /** 이메일 */
    private String email;
    /** 사용자 실명 */
    private String name;
    /** 닉네임 */
    private String nickname;
    /** 계정 활성 여부 */
    private Boolean isActive;
    /** 계정 잠금 여부 */
    private Boolean isLocked;
    /** 생성일시 */
    private LocalDateTime createdAt;
    /** 수정일시 */
    private LocalDateTime updatedAt;
    /** 삭제일시 */
    private LocalDateTime deletedAt;
}
