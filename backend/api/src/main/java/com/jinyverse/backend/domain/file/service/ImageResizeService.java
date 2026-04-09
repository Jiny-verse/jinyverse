package com.jinyverse.backend.domain.file.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ImageResizeService {

    private static final Set<String> RESIZABLE_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp");

    private static final int THUMBNAIL_WIDTH = 600;
    private static final int THUMBNAIL_QUALITY = 85;

    public boolean isResizable(String mimeType) {
        return mimeType != null && RESIZABLE_MIME_TYPES.contains(mimeType.toLowerCase());
    }

    /**
     * ImageMagick(convert)으로 썸네일 생성. JVM 힙과 분리된 외부 프로세스로 실행.
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
            List<String> cmd = List.of(
                    "convert",
                    originalAbsPath.toString(),
                    "-resize", THUMBNAIL_WIDTH + ">",
                    "-quality", String.valueOf(THUMBNAIL_QUALITY),
                    tempFile.toString()
            );

            Process process = new ProcessBuilder(cmd)
                    .redirectErrorStream(true)
                    .start();

            // 출력 스트림을 별도 스레드에서 소비 → 파이프 버퍼 데드락 방지
            StringBuilder output = new StringBuilder();
            Thread outputReader = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) output.append(line).append('\n');
                } catch (IOException ignored) {}
            });
            outputReader.setDaemon(true);
            outputReader.start();

            boolean finished;
            try {
                finished = process.waitFor(60, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
                throw new IOException("ImageMagick 프로세스 인터럽트", e);
            }
            if (!finished) {
                process.destroyForcibly();
                throw new IOException("ImageMagick 타임아웃 (60s)");
            }
            try { outputReader.join(1000); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
            int exitCode = process.exitValue();

            if (exitCode != 0) {
                throw new IOException("ImageMagick 실패 (exitCode=" + exitCode + "): " + output);
            }

            try {
                Files.move(tempFile, thumbPath, StandardCopyOption.ATOMIC_MOVE);
            } catch (java.nio.file.AtomicMoveNotSupportedException e) {
                Files.move(tempFile, thumbPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            Files.deleteIfExists(tempFile);
            throw e instanceof IOException ? (IOException) e : new IOException(e);
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
