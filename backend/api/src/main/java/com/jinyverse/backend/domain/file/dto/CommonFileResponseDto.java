package com.jinyverse.backend.domain.file.dto;

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
public class CommonFileResponseDto {

    /** 파일 고유 ID */
    private UUID id;
    /** 임시 업로드 세션 ID */
    private String sessionId;
    /** 원본 파일명 */
    private String originalName;
    /** 서버 저장 파일명 */
    private String storedName;
    /** 파일 저장 경로 */
    private String filePath;
    /** 파일 크기 (byte) */
    private Long fileSize;
    /** 파일 MIME 타입 */
    private String mimeType;
    /** 파일 확장자 */
    private String fileExt;
    /** 업로드 일시 */
    private LocalDateTime createdAt;
}
