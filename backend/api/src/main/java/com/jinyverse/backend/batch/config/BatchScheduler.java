package com.jinyverse.backend.batch.config;

import com.jinyverse.backend.batch.job.CleanupOrphanFilesJobConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;

    @Qualifier(CleanupOrphanFilesJobConfig.JOB_NAME)
    private final Job cleanupOrphanFilesJob;

    @Scheduled(cron = "0 0 0 * * *")
    public void runCleanupOrphanFiles() {
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("runAt", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(cleanupOrphanFilesJob, params);
            log.info("BatchScheduler: cleanupOrphanFilesJob 실행 시작");
        } catch (Exception e) {
            log.error("BatchScheduler: cleanupOrphanFilesJob 실행 실패 - {}", e.getMessage(), e);
        }
    }
}
