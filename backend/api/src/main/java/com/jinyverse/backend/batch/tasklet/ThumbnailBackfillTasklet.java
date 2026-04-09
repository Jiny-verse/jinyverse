package com.jinyverse.backend.batch.tasklet;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.file.service.ThumbnailAsyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ThumbnailBackfillTasklet implements Tasklet {

    private static final List<String> RESIZABLE_TYPES =
            List.of("image/jpeg", "image/jpg", "image/png", "image/webp");

    private final CommonFileRepository commonFileRepository;
    private final ThumbnailAsyncService thumbnailAsyncService;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        List<CommonFile> files = commonFileRepository.findByThumbnailPathIsNullAndMimeTypeIn(RESIZABLE_TYPES);
        log.info("ThumbnailBackfill: {}개 파일 썸네일 생성 트리거 시작", files.size());
        for (CommonFile f : files) {
            thumbnailAsyncService.generateAndSave(f.getId(), f.getFilePath(), f.getMimeType());
        }
        log.info("ThumbnailBackfill: 비동기 작업 {}개 트리거 완료", files.size());
        return RepeatStatus.FINISHED;
    }
}
