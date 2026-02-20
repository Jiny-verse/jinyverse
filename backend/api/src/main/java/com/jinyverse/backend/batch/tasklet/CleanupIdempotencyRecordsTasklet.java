package com.jinyverse.backend.batch.tasklet;

import com.jinyverse.backend.domain.idempotency.repository.IdempotencyRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupIdempotencyRecordsTasklet implements Tasklet {

    private final IdempotencyRecordRepository idempotencyRecordRepository;

    @Value("${app.batch.idempotency.age-hours:24}")
    private int ageHours;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        LocalDateTime before = LocalDateTime.now().minusHours(ageHours);
        int count = idempotencyRecordRepository.deleteCompletedOrFailedBefore(before);
        log.info("CleanupIdempotencyRecords: deleted {} record(s) (created before {})", count, before);
        return RepeatStatus.FINISHED;
    }
}
