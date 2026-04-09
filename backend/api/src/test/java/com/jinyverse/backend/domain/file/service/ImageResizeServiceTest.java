package com.jinyverse.backend.domain.file.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class ImageResizeServiceTest {

    private final ImageResizeService imageResizeService = new ImageResizeService();

    @TempDir
    Path tempDir;

    // ===== isResizable() =====

    @Test
    @DisplayName("isResizable: JPEG, PNG, WebP는 true")
    void isResizable_이미지타입_true() {
        assertThat(imageResizeService.isResizable("image/jpeg")).isTrue();
        assertThat(imageResizeService.isResizable("image/jpg")).isTrue();
        assertThat(imageResizeService.isResizable("image/png")).isTrue();
        assertThat(imageResizeService.isResizable("image/webp")).isTrue();
    }

    @Test
    @DisplayName("isResizable: SVG, GIF, PDF 등은 false")
    void isResizable_비대상타입_false() {
        assertThat(imageResizeService.isResizable("image/svg+xml")).isFalse();
        assertThat(imageResizeService.isResizable("image/gif")).isFalse();
        assertThat(imageResizeService.isResizable("application/pdf")).isFalse();
        assertThat(imageResizeService.isResizable("video/mp4")).isFalse();
        assertThat(imageResizeService.isResizable(null)).isFalse();
        assertThat(imageResizeService.isResizable("")).isFalse();
    }

    @Test
    @DisplayName("isResizable: 대소문자 구분 없이 처리")
    void isResizable_대소문자무관() {
        assertThat(imageResizeService.isResizable("IMAGE/JPEG")).isTrue();
        assertThat(imageResizeService.isResizable("Image/Png")).isTrue();
    }

    // ===== deriveRelativeThumbnailPath() =====

    @Test
    @DisplayName("deriveRelativeThumbnailPath: 날짜 경로 포함 파일 → _thumb 경로 반환")
    void deriveRelativeThumbnailPath_날짜경로포함() {
        String result = imageResizeService.deriveRelativeThumbnailPath("2025/03/15/uuid-abc.jpg");
        assertThat(result).isEqualTo("2025/03/15/_thumb/uuid-abc_thumb.jpg");
    }

    @Test
    @DisplayName("deriveRelativeThumbnailPath: 디렉터리 없는 경우")
    void deriveRelativeThumbnailPath_루트파일() {
        String result = imageResizeService.deriveRelativeThumbnailPath("myfile.png");
        assertThat(result).isEqualTo("_thumb/myfile_thumb.jpg");
    }

    @Test
    @DisplayName("deriveRelativeThumbnailPath: 확장자 없는 파일명")
    void deriveRelativeThumbnailPath_확장자없음() {
        String result = imageResizeService.deriveRelativeThumbnailPath("2025/01/01/noext");
        assertThat(result).isEqualTo("2025/01/01/_thumb/noext_thumb.jpg");
    }

    // ===== generateThumbnail() =====

    @Test
    @DisplayName("generateThumbnail: PNG 원본 → _thumb 디렉터리에 JPEG 썸네일 생성")
    void generateThumbnail_PNG_썸네일생성() throws IOException {
        assumeTrue(isImageMagickAvailable(), "ImageMagick(convert)이 설치되지 않아 skip");
        Path originalFile = createTestImage(tempDir, "test.png", 1200, 800);

        Path thumbPath = imageResizeService.generateThumbnail(originalFile);

        assertThat(thumbPath).exists();
        assertThat(thumbPath.getParent().getFileName().toString()).isEqualTo("_thumb");
        assertThat(thumbPath.getFileName().toString()).isEqualTo("test_thumb.jpg");

        // 썸네일 너비가 원본보다 작은지 확인
        BufferedImage thumbImage = ImageIO.read(thumbPath.toFile());
        assertThat(thumbImage.getWidth()).isLessThanOrEqualTo(600);
    }

    @Test
    @DisplayName("generateThumbnail: 원본보다 작은 이미지도 정상 처리")
    void generateThumbnail_소형이미지_처리() throws IOException {
        assumeTrue(isImageMagickAvailable(), "ImageMagick(convert)이 설치되지 않아 skip");
        Path originalFile = createTestImage(tempDir, "small.jpg", 100, 100);

        Path thumbPath = imageResizeService.generateThumbnail(originalFile);

        assertThat(thumbPath).exists();
        BufferedImage thumbImage = ImageIO.read(thumbPath.toFile());
        assertThat(thumbImage).isNotNull();
    }

    @Test
    @DisplayName("generateThumbnail: 두 번 호출해도 정상 덮어쓰기")
    void generateThumbnail_중복호출_덮어쓰기() throws IOException {
        assumeTrue(isImageMagickAvailable(), "ImageMagick(convert)이 설치되지 않아 skip");
        Path originalFile = createTestImage(tempDir, "dup.jpg", 800, 600);

        Path thumbPath1 = imageResizeService.generateThumbnail(originalFile);
        long size1 = Files.size(thumbPath1);

        Path thumbPath2 = imageResizeService.generateThumbnail(originalFile);

        assertThat(thumbPath1).isEqualTo(thumbPath2);
        assertThat(Files.size(thumbPath2)).isGreaterThan(0);
        assertThat(size1).isGreaterThan(0);
    }

    // ===== 헬퍼 =====

    private static boolean isImageMagickAvailable() {
        try {
            return new ProcessBuilder("convert", "--version").start().waitFor() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private Path createTestImage(Path dir, String filename, int width, int height) throws IOException {
        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        img.createGraphics().setColor(Color.BLUE);
        img.createGraphics().fillRect(0, 0, width, height);
        Path file = dir.resolve(filename);
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        ImageIO.write(img, ext.equalsIgnoreCase("jpg") ? "jpeg" : ext, file.toFile());
        return file;
    }
}
