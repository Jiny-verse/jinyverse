package com.jinyverse.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserJoinDto {

    /** 사용자 ID (내 글 여부 등 판별용) */
    private UUID id;
    /** 닉네임 (표시용) */
    private String nickname;
}
