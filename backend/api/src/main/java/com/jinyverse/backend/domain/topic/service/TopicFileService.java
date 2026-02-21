package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.topic.dto.RelTopicFileDto;
import com.jinyverse.backend.domain.topic.dto.TopicFileItemDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicFile;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicFileService {

    private final RelTopicFileRepository relTopicFileRepository;
    private final CommonFileRepository commonFileRepository;

    @Transactional
    public void saveTopicFiles(UUID topicId, List<TopicFileItemDto> files) {
        relTopicFileRepository.findByTopicId(topicId).forEach(relTopicFileRepository::delete);
        if (files == null || files.isEmpty()) return;
        for (int i = 0; i < files.size(); i++) {
            TopicFileItemDto item = files.get(i);
            int order = item.getOrder() != null ? item.getOrder() : i;
            boolean isMain = Boolean.TRUE.equals(item.getIsMain()) || (i == 0 && files.size() == 1);
            relTopicFileRepository.save(RelTopicFile.builder()
                    .topicId(topicId)
                    .fileId(item.getFileId())
                    .order(order)
                    .isMain(isMain)
                    .build());

            commonFileRepository.findById(item.getFileId()).ifPresent(file -> {
                if (file.getSessionId() != null) {
                    file.setSessionId(null);
                    commonFileRepository.save(file);
                }
            });
        }
    }

    public List<RelTopicFileDto> getFilesForTopic(UUID topicId) {
        return relTopicFileRepository.findByTopicId(topicId).stream()
                .map(RelTopicFile::toDto)
                .toList();
    }

    @Transactional
    public void moveFilesToTopic(UUID fromTopicId, UUID toTopicId) {
        List<RelTopicFile> files = relTopicFileRepository.findByTopicId(fromTopicId);
        files.forEach(f -> f.setTopicId(toTopicId));
        relTopicFileRepository.saveAll(files);
    }

    @Transactional
    public void deleteByTopicId(UUID topicId) {
        relTopicFileRepository.deleteByTopicId(topicId);
    }

    public void fillFilesForPage(Page<TopicResponseDto> page) {
        List<TopicResponseDto> content = page.getContent();
        if (content.isEmpty()) return;
        List<UUID> topicIds = content.stream().map(TopicResponseDto::getId).filter(Objects::nonNull).toList();
        if (topicIds.isEmpty()) return;
        List<RelTopicFile> rels = relTopicFileRepository.findByTopicIdIn(topicIds);
        Map<UUID, List<RelTopicFileDto>> topicToFiles = rels.stream()
                .collect(Collectors.groupingBy(RelTopicFile::getTopicId,
                        Collectors.mapping(RelTopicFile::toDto, Collectors.toList())));
        for (TopicResponseDto dto : content) {
            dto.setFiles(topicToFiles.getOrDefault(dto.getId(), List.of()));
        }
    }
}
