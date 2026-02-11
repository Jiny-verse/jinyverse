package com.jinyverse.backend.batch.tasklet;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.file.storage.FileStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupOrphanFilesTasklet implements Tasklet {

    private final CommonFileRepository commonFileRepository;
    private final FileStorage fileStorage;

    @Value("${app.batch.orphan-files.age-hours:24}")
    private int ageHours;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        LocalDateTime before = LocalDateTime.now().minusHours(ageHours);
        List<CommonFile> orphans = commonFileRepository.findOrphanFilesCreatedBefore(before);
        int count = orphans.size();

        for (CommonFile file : orphans) {
            try {
                if (file.getFilePath() != null && fileStorage.exists(file.getFilePath())) {
                    fileStorage.delete(file.getFilePath());
                }
            } catch (Exception e) {
                log.warn("CleanupOrphanFiles: failed to delete storage file {} - {}", file.getFilePath(),
                        e.getMessage());
            }
            commonFileRepository.delete(file);
        }

        log.info("CleanupOrphanFiles: deleted {} orphan file(s) (session_id, created before {})", count, before);
        return RepeatStatus.FINISHED;
    }
}
