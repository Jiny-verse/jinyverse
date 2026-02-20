package com.jinyverse.backend.batch.job;

import com.jinyverse.backend.batch.tasklet.CleanupIdempotencyRecordsTasklet;
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
public class CleanupIdempotencyRecordsJobConfig {

    public static final String JOB_NAME = "cleanupIdempotencyRecordsJob";
    private static final String STEP_NAME = "cleanupIdempotencyRecordsStep";

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final CleanupIdempotencyRecordsTasklet cleanupIdempotencyRecordsTasklet;

    @Bean(JOB_NAME)
    public Job cleanupIdempotencyRecordsJob() {
        return new JobBuilder(JOB_NAME, jobRepository)
                .start(cleanupIdempotencyRecordsStep())
                .build();
    }

    @Bean(STEP_NAME)
    public Step cleanupIdempotencyRecordsStep() {
        return new StepBuilder(STEP_NAME, jobRepository)
                .tasklet(cleanupIdempotencyRecordsTasklet, transactionManager)
                .build();
    }
}
