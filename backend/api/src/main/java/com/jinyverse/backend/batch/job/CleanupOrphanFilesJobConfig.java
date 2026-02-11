package com.jinyverse.backend.batch.job;

import com.jinyverse.backend.batch.tasklet.CleanupOrphanFilesTasklet;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class CleanupOrphanFilesJobConfig {

    public static final String JOB_NAME = "cleanupOrphanFilesJob";
    private static final String STEP_NAME = "cleanupOrphanFilesStep";

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final CleanupOrphanFilesTasklet cleanupOrphanFilesTasklet;

    @Bean(JOB_NAME)
    public Job cleanupOrphanFilesJob() {
        return new JobBuilder(JOB_NAME, jobRepository)
                .start(cleanupOrphanFilesStep())
                .build();
    }

    @Bean(STEP_NAME)
    public Step cleanupOrphanFilesStep() {
        return new StepBuilder(STEP_NAME, jobRepository)
                .tasklet(cleanupOrphanFilesTasklet, transactionManager)
                .build();
    }
}
