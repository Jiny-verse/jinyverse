package com.jinyverse.backend.batch.controller;

import com.jinyverse.backend.batch.job.CleanupOrphanFilesJobConfig;
import com.jinyverse.backend.batch.job.ThumbnailBackfillJobConfig;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class BatchJobController {

    private final JobLauncher jobLauncher;

    @Qualifier(CleanupOrphanFilesJobConfig.JOB_NAME)
    private final Job cleanupOrphanFilesJob;

    @Qualifier(ThumbnailBackfillJobConfig.JOB_NAME)
    private final Job thumbnailBackfillJob;

    private final CommonFileRepository commonFileRepository;

    private static final List<String> RESIZABLE_TYPES =
            List.of("image/jpeg", "image/jpg", "image/png", "image/webp");

    @GetMapping("/thumbnail-status")
    public ResponseEntity<Map<String, Long>> getThumbnailStatus(
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        long total = commonFileRepository.countByMimeTypeIn(RESIZABLE_TYPES);
        long withThumbnail = commonFileRepository.countByThumbnailPathIsNotNullAndMimeTypeIn(RESIZABLE_TYPES);
        return ResponseEntity.ok(Map.of(
                "total", total,
                "withThumbnail", withThumbnail,
                "withoutThumbnail", total - withThumbnail
        ));
    }

    @PostMapping("/cleanup-orphan-files")
    public ResponseEntity<Map<String, String>> runCleanupOrphanFiles(
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }

        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("runAt", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(cleanupOrphanFilesJob, params);
            return ResponseEntity.ok(Map.of("status", "started", "job", CleanupOrphanFilesJobConfig.JOB_NAME));
        } catch (Exception e) {
            log.error("cleanup-orphan-files 실행 실패", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message",
                            e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    @PostMapping("/thumbnail-backfill")
    public ResponseEntity<Map<String, String>> runThumbnailBackfill(
            @RequestHeader(value = "X-Channel", required = false) String channel,
            @RequestHeader(value = "X-Role", required = false) String role) {
        RequestContext ctx = RequestContext.fromHeaders(channel, role);
        if (ctx.getChannel() == null || !Channel.INTERNAL.equals(ctx.getChannel()) || !ctx.isAdmin()) {
            return ResponseEntity.status(403).build();
        }

        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("runAt", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(thumbnailBackfillJob, params);
            return ResponseEntity.ok(Map.of("status", "started", "job", ThumbnailBackfillJobConfig.JOB_NAME));
        } catch (Exception e) {
            log.error("thumbnail-backfill 실행 실패", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message",
                            e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }
}
