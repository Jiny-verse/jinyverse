package com.jinyverse.backend.batch.controller;

import com.jinyverse.backend.batch.job.CleanupOrphanFilesJobConfig;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class BatchJobController {

    private final JobLauncher jobLauncher;
    @Qualifier(CleanupOrphanFilesJobConfig.JOB_NAME)
    private final Job cleanupOrphanFilesJob;

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
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
