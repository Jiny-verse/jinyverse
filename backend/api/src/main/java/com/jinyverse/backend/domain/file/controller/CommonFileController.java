package com.jinyverse.backend.domain.file.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import com.jinyverse.backend.domain.file.dto.CommonFileRequestDto;
import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import com.jinyverse.backend.domain.file.dto.UploadSessionResponseDto;
import com.jinyverse.backend.domain.file.service.CommonFileService;
import com.jinyverse.backend.exception.ApiErrorResponse;
import com.jinyverse.backend.domain.file.service.UploadSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class CommonFileController {

    private final CommonFileService commonFileService;
    private final UploadSessionService uploadSessionService;

    @PostMapping("/upload-session")
    public ResponseEntity<UploadSessionResponseDto> createUploadSession() {
        var ctx = RequestContextHolder.get();
        if (ctx == null || !ctx.isAuthenticated() || ctx.getCurrentUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UploadSessionResponseDto dto = uploadSessionService.issue(ctx.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            var ctx = RequestContextHolder.get();
            if (ctx == null || !ctx.isAuthenticated() || ctx.getCurrentUserId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            uploadSessionService.validate(sessionId, ctx.getCurrentUserId());
        }
        try {
            CommonFileResponseDto response = commonFileService.uploadFromMultipart(file, sessionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiErrorResponse("FILE_STORAGE_NOT_CONFIGURED",
                            e.getMessage() != null && !e.getMessage().isBlank() ? e.getMessage()
                                    : "파일 저장 경로가 설정되지 않았습니다. 관리자 설정에서 파일 저장소 경로를 입력하세요."));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        try {
            var ctx = RequestContextHolder.get();
            commonFileService.checkDownloadAccess(id, ctx);

            CommonFileResponseDto meta = commonFileService.getById(id);
            Resource resource = commonFileService.getResourceForDownload(id);
            String filename = meta.getOriginalName() != null ? meta.getOriginalName() : meta.getStoredName();
            String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            meta.getMimeType() != null ? meta.getMimeType() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                    .body(resource);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<CommonFileResponseDto> create(@Valid @RequestBody CommonFileRequestDto requestDto) {
        CommonFileResponseDto response = commonFileService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommonFileResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            @RequestHeader(value = "X-Channel", required = false) String channel) {
        Page<CommonFileResponseDto> responses = commonFileService.getAll(filter, pageable,
                RequestContext.fromChannelHeader(channel));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonFileResponseDto> getById(@PathVariable UUID id) {
        CommonFileResponseDto response = commonFileService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommonFileResponseDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody CommonFileRequestDto requestDto) {
        CommonFileResponseDto response = commonFileService.update(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        commonFileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
