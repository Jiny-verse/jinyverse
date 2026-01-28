package com.jinyverse.backend.domain.file.entity;

import com.jinyverse.backend.domain.common.BaseFileEntity;
import com.jinyverse.backend.domain.file.dto.CommonFileRequestDto;
import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "common_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonFile extends BaseFileEntity {

    /** 파일 고유 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    public static CommonFile fromRequestDto(CommonFileRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("CommonFileRequestDto is null");
        CommonFile commonFile = new CommonFile();
        commonFile.setSessionId(dto.getSessionId());
        commonFile.setOriginalName(dto.getOriginalName());
        commonFile.setStoredName(dto.getStoredName());
        commonFile.setFilePath(dto.getFilePath());
        commonFile.setFileSize(dto.getFileSize());
        commonFile.setMimeType(dto.getMimeType());
        commonFile.setFileExt(dto.getFileExt());
        return commonFile;
    }

    public void applyUpdate(CommonFileRequestDto dto) {
        if (dto == null) return;
        if (dto.getSessionId() != null) this.setSessionId(dto.getSessionId());
        if (dto.getOriginalName() != null) this.setOriginalName(dto.getOriginalName());
        if (dto.getStoredName() != null) this.setStoredName(dto.getStoredName());
        if (dto.getFilePath() != null) this.setFilePath(dto.getFilePath());
        if (dto.getFileSize() != null) this.setFileSize(dto.getFileSize());
        if (dto.getMimeType() != null) this.setMimeType(dto.getMimeType());
        if (dto.getFileExt() != null) this.setFileExt(dto.getFileExt());
    }

    public CommonFileRequestDto toDto() {
        return CommonFileRequestDto.builder()
                .sessionId(this.getSessionId())
                .originalName(this.getOriginalName())
                .storedName(this.getStoredName())
                .filePath(this.getFilePath())
                .fileSize(this.getFileSize())
                .mimeType(this.getMimeType())
                .fileExt(this.getFileExt())
                .build();
    }

    public CommonFileResponseDto toResponseDto() {
        return CommonFileResponseDto.builder()
                .id(this.id)
                .sessionId(this.getSessionId())
                .originalName(this.getOriginalName())
                .storedName(this.getStoredName())
                .filePath(this.getFilePath())
                .fileSize(this.getFileSize())
                .mimeType(this.getMimeType())
                .fileExt(this.getFileExt())
                .createdAt(this.getCreatedAt())
                .build();
    }
}
