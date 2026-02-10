package com.jinyverse.backend.domain.setting.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 파일 저장소 설정 (관리단에서 편집) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileStorageSettingDto {

    /** 파일 저장 기본 경로 (디렉터리 절대 경로) */
    @Size(max = 500, message = "저장 경로는 500자 이하여야 합니다")
    private String basePath;
}
