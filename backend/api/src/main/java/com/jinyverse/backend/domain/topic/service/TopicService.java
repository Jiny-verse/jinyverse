package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;

    @Transactional
    public TopicResponseDto create(TopicRequestDto requestDto) {
        Topic topic = Topic.fromRequestDto(requestDto);
        Topic saved = topicRepository.save(topic);
        return saved.toResponseDto();
    }

    public TopicResponseDto getById(UUID id) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));
        return topic.toResponseDto();
    }

    public Page<TopicResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return topicRepository.findAll(spec(ctx), pageable).map(Topic::toResponseDto);
    }

    @Transactional
    public TopicResponseDto update(UUID id, TopicRequestDto requestDto) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        topic.applyUpdate(requestDto);
        Topic updated = topicRepository.save(topic);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        topic.setDeletedAt(LocalDateTime.now());
        topicRepository.save(topic);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Topic> spec(RequestContext ctx) {
        Specification<Topic> result = CommonSpecifications.notDeleted();

        // 채널별 권한 조건 (external이면 공개글만 조회 가능)
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            result = result.and(CommonSpecifications.eqIfPresent("isPublic", true));
        }

        return result;
    }
}
