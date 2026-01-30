package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.common.util.Channel;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;

    @Transactional
    public TopicResponseDto create(TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic create requires ADMIN on INTERNAL channel");
        }
        Topic topic = Topic.fromRequestDto(requestDto);
        Topic saved = topicRepository.save(topic);
        return saved.toResponseDto();
    }

    public TopicResponseDto getById(UUID id) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));
        return topic.toResponseDto();
    }

    public Page<TopicResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return topicRepository.findAll(spec(ctx, filter), pageable).map(Topic::toResponseDto);
    }

    public long count() {
        return topicRepository.countByDeletedAtIsNull();
    }

    @Transactional
    public TopicResponseDto update(UUID id, TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic update requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        topic.applyUpdate(requestDto);
        Topic updated = topicRepository.save(topic);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic delete requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        topic.setDeletedAt(LocalDateTime.now());
        topicRepository.save(topic);
    }

    private Specification<Topic> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<Topic> s = CommonSpecifications.notDeleted();
        
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent("isPublic", true));
        }
        
        for (Map.Entry<String, Object> entry : filter.entrySet()) {
            String key = entry.getKey();
            if (PAGINATION_KEYS.contains(key)) continue;
            Object value = entry.getValue();
            if ("q".equals(key)) {
                s = CommonSpecifications.and(s, CommonSpecifications.keywordLikeAny((String) value, "title", "content"));
            } else {
                s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent(key, value));
            }
        }
        
        return s;
    }
}
