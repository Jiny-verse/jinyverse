package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import com.jinyverse.backend.domain.tag.entity.Tag;
import com.jinyverse.backend.domain.tag.repository.TagRepository;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
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
public class TopicTagService {

    private final RelTopicTagRepository relTopicTagRepository;
    private final TagRepository tagRepository;

    @Transactional
    public void saveTopicTags(UUID topicId, List<UUID> tagIds) {
        relTopicTagRepository.findByTopicId(topicId).forEach(relTopicTagRepository::delete);
        if (tagIds != null && !tagIds.isEmpty()) {
            for (UUID tagId : tagIds) {
                relTopicTagRepository.save(RelTopicTag.builder().topicId(topicId).tagId(tagId).build());
            }
        }
    }

    public TopicResponseDto fillTagsForSingle(UUID topicId, TopicResponseDto dto) {
        List<RelTopicTag> rels = relTopicTagRepository.findByTopicId(topicId);
        if (rels.isEmpty()) {
            dto.setTags(List.of());
        } else {
            List<UUID> tagIds = rels.stream().map(RelTopicTag::getTagId).distinct().toList();
            List<Tag> tags = tagRepository.findAllById(tagIds);
            dto.setTags(tags.stream().map(Tag::toResponseDto).toList());
        }
        return dto;
    }

    public void fillTagsForPage(Page<TopicResponseDto> page) {
        List<TopicResponseDto> content = page.getContent();
        if (content.isEmpty()) return;
        List<UUID> topicIds = content.stream().map(TopicResponseDto::getId).filter(Objects::nonNull).toList();
        if (topicIds.isEmpty()) return;
        List<RelTopicTag> rels = relTopicTagRepository.findByTopicIdIn(topicIds);
        Map<UUID, List<UUID>> topicToTagIds = rels.stream()
                .collect(Collectors.groupingBy(RelTopicTag::getTopicId,
                        Collectors.mapping(RelTopicTag::getTagId, Collectors.toList())));
        List<UUID> allTagIds = rels.stream().map(RelTopicTag::getTagId).distinct().toList();
        if (allTagIds.isEmpty()) {
            content.forEach(dto -> dto.setTags(List.of()));
            return;
        }
        Map<UUID, TagResponseDto> tagMap = tagRepository.findAllById(allTagIds)
                .stream()
                .collect(Collectors.toMap(Tag::getId, Tag::toResponseDto));
        for (TopicResponseDto dto : content) {
            List<UUID> ids = topicToTagIds.getOrDefault(dto.getId(), List.of());
            dto.setTags(ids.stream().map(tagMap::get).filter(Objects::nonNull).toList());
        }
    }
}
