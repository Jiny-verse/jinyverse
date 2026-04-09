package com.jinyverse.backend.domain.file.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class ImageResizeService {

    private static final Set<String> RESIZABLE_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp");

    private static final int THUMBNAIL_WIDTH = 600;
    private static final double THUMBNAIL_QUALITY = 0.85;

    public boolean isResizable(String mimeType) {
        return mimeType != null && RESIZABLE_MIME_TYPES.contains(mimeType.toLowerCase());
    }

    /**
     * 썸네일을 생성하고 원본 파일과 같은 디렉터리의 _thumb/ 하위에 저장한다.
     * 저장 경로: {originalDir}/_thumb/{stem}_thumb.jpg
     *
     * @param originalAbsPath 원본 파일의 절대 경로
     * @return 생성된 썸네일의 절대 경로
     */
    public Path generateThumbnail(Path originalAbsPath) throws IOException {
        Path thumbDir = originalAbsPath.getParent().resolve("_thumb");
        Files.createDirectories(thumbDir);

        String originalFilename = originalAbsPath.getFileName().toString();
        String stem = stripExtension(originalFilename);
        Path thumbPath = thumbDir.resolve(stem + "_thumb.jpg");

        // 임시 파일에 먼저 쓰고 원자적으로 이동 (동시 요청 안전)
        Path tempFile = thumbDir.resolve(stem + "_thumb.tmp." + UUID.randomUUID() + ".jpg");
        try {
            Thumbnails.of(originalAbsPath.toFile())
                    .width(THUMBNAIL_WIDTH)
                    .outputFormat("jpg")
                    .outputQuality(THUMBNAIL_QUALITY)
                    .toFile(tempFile.toFile());

            try {
                Files.move(tempFile, thumbPath, StandardCopyOption.ATOMIC_MOVE);
            } catch (java.nio.file.AtomicMoveNotSupportedException e) {
                Files.move(tempFile, thumbPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            Files.deleteIfExists(tempFile);
            throw e;
        }

        return thumbPath;
    }

    /**
     * originalRelativePath (예: "2025/03/15/uuid.jpg") 로부터
     * 썸네일 상대 경로 (예: "2025/03/15/_thumb/uuid_thumb.jpg") 를 계산한다.
     */
    public String deriveRelativeThumbnailPath(String originalRelativePath) {
        int lastSlash = originalRelativePath.lastIndexOf('/');
        String dir = lastSlash >= 0 ? originalRelativePath.substring(0, lastSlash) : "";
        String filename = lastSlash >= 0 ? originalRelativePath.substring(lastSlash + 1) : originalRelativePath;
        String stem = stripExtension(filename);
        String prefix = dir.isEmpty() ? "" : dir + "/";
        return prefix + "_thumb/" + stem + "_thumb.jpg";
    }

    private static String stripExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }
}
