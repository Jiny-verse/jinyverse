package com.jinyverse.backend.domain.file.service;

import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.file.storage.FileStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailAsyncService {

    private final CommonFileRepository commonFileRepository;
    private final ImageResizeService imageResizeService;
    private final FileStorage fileStorage;

    /**
     * 비동기로 썸네일을 생성하고 DB에 경로를 저장한다.
     * HTTP 요청 스레드를 블로킹하지 않으며, JVM 힙과 분리된 ImageMagick 프로세스로 처리.
     */
    @Async
    @Transactional
    public void generateAndSave(UUID fileId, String filePath, String mimeType) {
        if (!imageResizeService.isResizable(mimeType)) return;
        try {
            Resource original = fileStorage.getResource(filePath);
            if (original == null || !original.exists()) {
                log.warn("ThumbnailAsyncService: 원본 파일 없음 fileId={}", fileId);
                return;
            }
            imageResizeService.generateThumbnail(original.getFile().toPath());
            String thumbPath = imageResizeService.deriveRelativeThumbnailPath(filePath);
            commonFileRepository.findById(fileId).ifPresent(f -> {
                f.setThumbnailPath(thumbPath);
                commonFileRepository.save(f);
                log.debug("ThumbnailAsyncService: 썸네일 저장 완료 fileId={}", fileId);
            });
        } catch (Exception e) {
            log.warn("ThumbnailAsyncService: 썸네일 생성 실패 fileId={} - {}", fileId, e.getMessage());
        }
    }
}
