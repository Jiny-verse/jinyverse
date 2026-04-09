package com.jinyverse.backend.domain.file.service;

import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.file.storage.FileStorage;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import org.mockito.Mockito;

@ExtendWith(MockitoExtension.class)
class CommonFileServiceThumbnailTest {

    @Mock private CommonFileRepository commonFileRepository;
    @Mock private FileStorage fileStorage;
    @Mock private ImageResizeService imageResizeService;
    @Mock private RelTopicFileRepository relTopicFileRepository;
    @Mock private TopicRepository topicRepository;

    @InjectMocks
    private CommonFileService commonFileService;

    @TempDir
    Path tempDir;

    // ===== 업로드 시 썸네일 생성 =====

    @Test
    @DisplayName("uploadFromMultipart: 이미지 파일이면 썸네일 생성 후 thumbnailPath 저장")
    void uploadFromMultipart_이미지_썸네일생성() throws IOException {
        MultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[]{1, 2, 3});

        Path thumbFile = tempDir.resolve("photo_thumb.jpg");
        Files.createFile(thumbFile);

        FileSystemResource fakeResource = new FileSystemResource(tempDir.resolve("photo.jpg").toFile());
        Files.createFile(tempDir.resolve("photo.jpg"));

        when(imageResizeService.isResizable("image/jpeg")).thenReturn(true);
        when(fileStorage.getResource(any())).thenReturn(fakeResource);
        when(imageResizeService.generateThumbnail(any(Path.class))).thenReturn(thumbFile);
        when(imageResizeService.deriveRelativeThumbnailPath(any())).thenReturn("2025/01/01/_thumb/photo_thumb.jpg");

        ArgumentCaptor<CommonFile> captor = ArgumentCaptor.forClass(CommonFile.class);
        when(commonFileRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        CommonFileResponseDto result = commonFileService.uploadFromMultipart(file, null);

        assertThat(result).isNotNull();
        assertThat(captor.getValue().getThumbnailPath()).isEqualTo("2025/01/01/_thumb/photo_thumb.jpg");
        verify(imageResizeService).generateThumbnail(any(Path.class));
    }

    @Test
    @DisplayName("uploadFromMultipart: 이미지가 아닌 파일은 썸네일 생성 안 함")
    void uploadFromMultipart_비이미지_썸네일없음() throws IOException {
        MultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", new byte[]{1, 2, 3});

        when(imageResizeService.isResizable("application/pdf")).thenReturn(false);

        ArgumentCaptor<CommonFile> captor = ArgumentCaptor.forClass(CommonFile.class);
        when(commonFileRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        commonFileService.uploadFromMultipart(file, null);

        assertThat(captor.getValue().getThumbnailPath()).isNull();
        verify(imageResizeService, never()).generateThumbnail(any());
    }

    @Test
    @DisplayName("uploadFromMultipart: 썸네일 생성 실패해도 업로드는 성공")
    void uploadFromMultipart_썸네일실패_업로드유지() throws IOException {
        MultipartFile file = new MockMultipartFile(
                "file", "photo.png", "image/png", new byte[]{1, 2, 3});

        FileSystemResource fakeResource = new FileSystemResource(tempDir.resolve("photo.png").toFile());
        Files.createFile(tempDir.resolve("photo.png"));

        when(imageResizeService.isResizable("image/png")).thenReturn(true);
        when(fileStorage.getResource(any())).thenReturn(fakeResource);
        when(imageResizeService.generateThumbnail(any(Path.class)))
                .thenThrow(new IOException("리사이즈 실패"));

        ArgumentCaptor<CommonFile> captor = ArgumentCaptor.forClass(CommonFile.class);
        when(commonFileRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        // 예외 없이 정상 완료
        CommonFileResponseDto result = commonFileService.uploadFromMultipart(file, null);

        assertThat(result).isNotNull();
        assertThat(captor.getValue().getThumbnailPath()).isNull();
    }

    // ===== 삭제 시 썸네일 삭제 =====

    @Test
    @DisplayName("delete: thumbnailPath가 있으면 썸네일 파일도 삭제")
    void delete_썸네일파일_함께삭제() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.jpg");
        entity.setThumbnailPath("2025/01/01/_thumb/uuid_thumb.jpg");

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.exists("2025/01/01/uuid.jpg")).thenReturn(true);

        commonFileService.delete(fileId);

        verify(fileStorage).delete("2025/01/01/uuid.jpg");
        verify(fileStorage).delete("2025/01/01/_thumb/uuid_thumb.jpg");
        verify(commonFileRepository).delete(entity);
    }

    @Test
    @DisplayName("delete: thumbnailPath가 null이면 썸네일 삭제 시도 안 함")
    void delete_썸네일없으면_삭제생략() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.pdf");
        entity.setThumbnailPath(null);

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.exists("2025/01/01/uuid.pdf")).thenReturn(true);

        commonFileService.delete(fileId);

        verify(fileStorage).delete("2025/01/01/uuid.pdf");
        // thumbnailPath가 null이므로 두 번째 delete 호출 없음
        verify(fileStorage, times(1)).delete(any());
    }

    @Test
    @DisplayName("delete: 썸네일 삭제 실패해도 원본 삭제 및 DB 삭제는 정상 진행")
    void delete_썸네일삭제실패_원본삭제유지() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.jpg");
        entity.setThumbnailPath("2025/01/01/_thumb/uuid_thumb.jpg");

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.exists("2025/01/01/uuid.jpg")).thenReturn(true);
        // strict 모드에서 다른 인자 호출과 충돌하지 않도록 lenient 처리
        Mockito.lenient().doThrow(new IOException("삭제 실패")).when(fileStorage).delete("2025/01/01/_thumb/uuid_thumb.jpg");

        // 예외 없이 정상 완료
        commonFileService.delete(fileId);

        verify(fileStorage).delete("2025/01/01/uuid.jpg");
        verify(commonFileRepository).delete(entity);
    }

    // ===== getResourceForThumbnail() =====

    @Test
    @DisplayName("getResourceForThumbnail: thumbnailPath 있으면 썸네일 반환")
    void getResourceForThumbnail_썸네일존재_반환() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.jpg");
        entity.setThumbnailPath("2025/01/01/_thumb/uuid_thumb.jpg");

        FileSystemResource thumbResource = mock(FileSystemResource.class);
        when(thumbResource.exists()).thenReturn(true);

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.getResource("2025/01/01/_thumb/uuid_thumb.jpg")).thenReturn(thumbResource);

        var result = commonFileService.getResourceForThumbnail(fileId);

        assertThat(result).isSameAs(thumbResource);
        verify(fileStorage, never()).getResource("2025/01/01/uuid.jpg");
    }

    @Test
    @DisplayName("getResourceForThumbnail: thumbnailPath 없으면 원본 fallback")
    void getResourceForThumbnail_썸네일없으면_원본반환() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.jpg");
        entity.setThumbnailPath(null);

        FileSystemResource originalResource = mock(FileSystemResource.class);
        when(originalResource.exists()).thenReturn(true);

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.getResource("2025/01/01/uuid.jpg")).thenReturn(originalResource);

        var result = commonFileService.getResourceForThumbnail(fileId);

        assertThat(result).isSameAs(originalResource);
    }

    @Test
    @DisplayName("getResourceForThumbnail: thumbnailPath 있지만 파일 없으면 원본 fallback")
    void getResourceForThumbnail_썸네일파일없으면_원본반환() throws IOException {
        UUID fileId = UUID.randomUUID();
        CommonFile entity = new CommonFile();
        entity.setFilePath("2025/01/01/uuid.jpg");
        entity.setThumbnailPath("2025/01/01/_thumb/uuid_thumb.jpg");

        FileSystemResource missingThumb = mock(FileSystemResource.class);
        when(missingThumb.exists()).thenReturn(false); // 파일이 실제로 없는 상황

        FileSystemResource originalResource = mock(FileSystemResource.class);
        when(originalResource.exists()).thenReturn(true);

        when(commonFileRepository.findById(fileId)).thenReturn(Optional.of(entity));
        when(fileStorage.getResource("2025/01/01/_thumb/uuid_thumb.jpg")).thenReturn(missingThumb);
        when(fileStorage.getResource("2025/01/01/uuid.jpg")).thenReturn(originalResource);

        var result = commonFileService.getResourceForThumbnail(fileId);

        assertThat(result).isSameAs(originalResource);
    }
}
