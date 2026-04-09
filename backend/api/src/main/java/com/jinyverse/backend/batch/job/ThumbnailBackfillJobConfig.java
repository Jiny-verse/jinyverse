package com.jinyverse.backend.batch.job;

import com.jinyverse.backend.batch.tasklet.ThumbnailBackfillTasklet;
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
public class ThumbnailBackfillJobConfig {

    public static final String JOB_NAME = "thumbnailBackfillJob";
    private static final String STEP_NAME = "thumbnailBackfillStep";

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final ThumbnailBackfillTasklet thumbnailBackfillTasklet;

    @Bean(JOB_NAME)
    public Job thumbnailBackfillJob() {
        return new JobBuilder(JOB_NAME, jobRepository)
                .start(thumbnailBackfillStep())
                .build();
    }

    @Bean(STEP_NAME)
    public Step thumbnailBackfillStep() {
        return new StepBuilder(STEP_NAME, jobRepository)
                .tasklet(thumbnailBackfillTasklet, transactionManager)
                .build();
    }
}
