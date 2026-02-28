package com.jinyverse.backend.domain.file.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import com.jinyverse.backend.domain.file.dto.CommonFileRequestDto;
import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.file.storage.FileStorage;
import com.jinyverse.backend.domain.topic.entity.RelTopicFile;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import com.jinyverse.backend.exception.ForbiddenException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonFileService {

    private final CommonFileRepository commonFileRepository;
    private final FileStorage fileStorage;
    private final RelTopicFileRepository relTopicFileRepository;
    private final TopicRepository topicRepository;

    private static final Set<String> ALLOWED_MIME_PREFIXES = Set.of("image/", "video/", "audio/");

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "application/gzip",
            "application/x-tar",
            "text/plain",
            "text/csv",
            "application/json",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation");

    /** 차단할 실행 가능 확장자 */
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".sh", ".bat", ".cmd", ".ps1", ".msi", ".jar",
            ".js", ".mjs", ".ts", ".php", ".py", ".rb", ".pl", ".go");

    @Transactional
    public CommonFileResponseDto create(CommonFileRequestDto requestDto) {
        CommonFile commonFile = CommonFile.fromRequestDto(requestDto);
        CommonFile saved = commonFileRepository.save(commonFile);
        return saved.toResponseDto();
    }

    public CommonFileResponseDto getById(UUID id) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommonFile", id));
        return commonFile.toResponseDto();
    }

    public Page<CommonFileResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return commonFileRepository.findAll(spec(ctx, filter), pageable).map(CommonFile::toResponseDto);
    }

    @Transactional
    public CommonFileResponseDto update(UUID id, CommonFileRequestDto requestDto) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommonFile", id));

        commonFile.applyUpdate(requestDto);
        CommonFile updated = commonFileRepository.save(commonFile);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommonFile", id));
        try {
            if (commonFile.getFilePath() != null && fileStorage.exists(commonFile.getFilePath())) {
                fileStorage.delete(commonFile.getFilePath());
            }
        } catch (IOException e) {
            log.warn("CommonFileService.delete: 스토리지 파일 삭제 실패 {} - {}", commonFile.getFilePath(), e.getMessage());
        }
        commonFileRepository.delete(commonFile);
    }

    @Transactional
    public CommonFileResponseDto uploadFromMultipart(MultipartFile file, String sessionId) throws IOException {
        validateMimeType(file);

        String originalName = sanitizeFilename(
                file.getOriginalFilename() != null && !file.getOriginalFilename().isBlank()
                        ? file.getOriginalFilename()
                        : "file");
        String ext = extractExt(originalName);
        validateExtension(ext);

        String storedName = UUID.randomUUID().toString() + (ext != null ? ext : "");
        LocalDate today = LocalDate.now();
        String relativePath = String.format("%d/%02d/%02d/%s",
                today.getYear(), today.getMonthValue(), today.getDayOfMonth(), storedName);

        fileStorage.save(relativePath, file.getInputStream(), file.getSize());

        CommonFile entity = new CommonFile();
        entity.setSessionId(sessionId != null && !sessionId.isBlank() ? sessionId : null);
        entity.setOriginalName(originalName);
        entity.setStoredName(storedName);
        entity.setFilePath(relativePath);
        entity.setFileSize(file.getSize());
        entity.setMimeType(file.getContentType() != null && !file.getContentType().isBlank()
                ? file.getContentType()
                : "application/octet-stream");
        entity.setFileExt(ext);

        try {
            CommonFile saved = commonFileRepository.save(entity);
            return saved.toResponseDto();
        } catch (Exception e) {
            try {
                fileStorage.delete(relativePath);
            } catch (IOException deleteEx) {
                log.error("CommonFileService: DB 저장 실패 후 물리 파일 삭제도 실패 {} - {}", relativePath, deleteEx.getMessage());
            }
            throw e;
        }
    }

    public Resource getResourceForDownload(UUID id) throws IOException {
        CommonFile file = commonFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommonFile", id));
        Resource resource = fileStorage.getResource(file.getFilePath());
        if (resource == null || !resource.exists()) {
            throw new IOException("File not found in storage: " + file.getFilePath());
        }
        return resource;
    }

    public void checkDownloadAccess(UUID fileId, RequestContext ctx) {
        List<RelTopicFile> fileRels = relTopicFileRepository.findByFileId(fileId);
        if (fileRels.isEmpty())
            return;

        for (RelTopicFile rel : fileRels) {
            Topic topic = topicRepository.findByIdAndDeletedAtIsNull(rel.getTopicId()).orElse(null);
            if (topic == null)
                continue;
            if (Boolean.TRUE.equals(topic.getIsPublic()) && !"temporary".equals(topic.getStatus())) {
                return;
            }
            if (ctx != null && ctx.isAuthenticated()) {
                if (ctx.isAdmin() || topic.getAuthorUserId().equals(ctx.getCurrentUserId())) {
                    return;
                }
            }
        }
        throw new ForbiddenException("해당 파일에 접근할 권한이 없습니다.");
    }

    public CommonFile getEntityById(UUID id) {
        return commonFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommonFile", id));
    }

    private void validateMimeType(MultipartFile file) {
        String mime = file.getContentType();
        if (mime == null || mime.isBlank())
            return;
        String normalizedMime = mime.toLowerCase();
        boolean allowed = ALLOWED_MIME_PREFIXES.stream().anyMatch(normalizedMime::startsWith)
                || ALLOWED_MIME_TYPES.contains(normalizedMime);
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "허용되지 않는 파일 형식입니다: " + mime);
        }
    }

    private void validateExtension(String ext) {
        if (ext == null)
            return;
        if (BLOCKED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "허용되지 않는 파일 확장자입니다: " + ext);
        }
    }

    private static String sanitizeFilename(String originalName) {
        String name = originalName.replaceAll("[/\\\\]", "");
        name = name.replace(" ", "_");
        name = name.replaceAll("[^가-힣a-zA-Z0-9._\\-]", "");
        return name.isBlank() ? "file" : name;
    }

    private static String extractExt(String originalName) {
        if (originalName == null)
            return null;
        int i = originalName.lastIndexOf('.');
        return (i >= 0 && i < originalName.length() - 1) ? originalName.substring(i) : null;
    }

    private Specification<CommonFile> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                (root, query, cb) -> cb.conjunction(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q",
                        new String[] { "originalName", "storedName" }));
    }
}
