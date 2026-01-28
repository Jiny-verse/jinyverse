package com.jinyverse.backend.domain.file.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CommonFileRequestDto {

    /** 임시 업로드 세션 ID */
    @Size(max = 64, message = "세션 ID는 64자 이하여야 합니다")
    private String sessionId;

    /** 원본 파일명 */
    @NotBlank(message = "원본 파일명은 필수입니다")
    @Size(max = 255, message = "원본 파일명은 255자 이하여야 합니다")
    private String originalName;

    /** 서버 저장 파일명 */
    @NotBlank(message = "저장 파일명은 필수입니다")
    @Size(max = 255, message = "저장 파일명은 255자 이하여야 합니다")
    private String storedName;

    /** 파일 저장 경로 */
    @NotBlank(message = "파일 경로는 필수입니다")
    private String filePath;

    /** 파일 크기 (byte) */
    @NotNull(message = "파일 크기는 필수입니다")
    private Long fileSize;

    /** 파일 MIME 타입 */
    @NotBlank(message = "MIME 타입은 필수입니다")
    @Size(max = 100, message = "MIME 타입은 100자 이하여야 합니다")
    private String mimeType;

    /** 파일 확장자 */
    @Size(max = 20, message = "파일 확장자는 20자 이하여야 합니다")
    private String fileExt;
}
