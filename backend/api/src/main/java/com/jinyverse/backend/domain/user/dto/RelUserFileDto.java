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
public class RelUserFileDto {

    /** 사용자-파일 연결 ID */
    private UUID id;
    /** 사용자 ID */
    private UUID userId;
    /** 파일 ID */
    private UUID fileId;
    /** 파일 사용 목적 (PROFILE, COVER 등) */
    private String usage;
    /** 대표 이미지 여부 */
    private Boolean isMain;
    /** 연결 생성일시 */
    private LocalDateTime createdAt;
}
