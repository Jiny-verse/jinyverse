package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.comment.entity.Comment;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicFile;
import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;
    private final RelTopicFileRepository relTopicFileRepository;
    private final RelTopicTagRepository relTopicTagRepository;

    @Transactional
    public TopicResponseDto create(TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic create requires ADMIN on INTERNAL channel");
        }
        Topic topic = Topic.fromRequestDto(requestDto);
        if ("temporary".equals(requestDto.getStatus())) {
            topic.setIsPublic(false);
        }
        Topic saved = topicRepository.save(topic);
        return saved.toResponseDto();
    }

    public TopicResponseDto getById(UUID id, RequestContext ctx) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found with id: " + id));
        if (ctx != null && ctx.getChannel() == Channel.EXTERNAL) {
            boolean privateOrDraft = !Boolean.TRUE.equals(topic.getIsPublic()) || "temporary".equals(topic.getStatus());
            if (privateOrDraft) {
                boolean allowed = ctx.getUserId() != null
                        && (topic.getAuthorUserId().equals(ctx.getUserId()) || ctx.isAdmin());
                if (!allowed) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this topic");
                }
            }
        }
        return topic.toResponseDto();
    }

    public Page<TopicResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return topicRepository.findAll(spec(ctx, filter), pageable).map(Topic::toResponseDto);
    }

    public long count() {
        return topicRepository.count(spec(null, Map.of()));
    }

    @Transactional
    public TopicResponseDto update(UUID id, TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic update requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        if (topic.getSourceTopicId() != null && "created".equals(requestDto.getStatus())) {
            return promoteDraft(topic, requestDto);
        }
        if (topic.getSourceTopicId() == null && Boolean.FALSE.equals(topic.getHidden())
                && "temporary".equals(requestDto.getStatus())) {
            return createDraftAndHideOriginal(topic, requestDto);
        }

        topic.applyUpdate(requestDto);
        if ("temporary".equals(topic.getStatus())) {
            topic.setIsPublic(false);
        }
        Topic updated = topicRepository.save(topic);
        return updated.toResponseDto();
    }

    private TopicResponseDto promoteDraft(Topic draft, TopicRequestDto requestDto) {
        UUID originalId = draft.getSourceTopicId();
        UUID draftId = draft.getId();

        List<Comment> comments = commentRepository.findByTopicId(originalId);
        comments.forEach(c -> c.setTopicId(draftId));
        commentRepository.saveAll(comments);

        List<RelTopicFile> files = relTopicFileRepository.findByTopicId(originalId);
        files.forEach(f -> f.setTopicId(draftId));
        relTopicFileRepository.saveAll(files);

        List<RelTopicTag> tags = relTopicTagRepository.findByTopicId(originalId);
        tags.forEach(t -> t.setTopicId(draftId));
        relTopicTagRepository.saveAll(tags);

        Topic original = topicRepository.findByIdAndDeletedAtIsNull(originalId)
                .orElseThrow(() -> new RuntimeException("Original topic not found: " + originalId));
        original.setDeletedAt(LocalDateTime.now());
        topicRepository.save(original);

        draft.setSourceTopicId(null);
        draft.setStatus("created");
        draft.applyUpdate(requestDto);
        Topic saved = topicRepository.save(draft);
        return saved.toResponseDto();
    }

    private TopicResponseDto createDraftAndHideOriginal(Topic original, TopicRequestDto requestDto) {
        Topic draft = Topic.draftOf(original, requestDto);
        Topic savedDraft = topicRepository.save(draft);
        original.setHidden(true);
        topicRepository.save(original);
        return savedDraft.toResponseDto();
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
        s = CommonSpecifications.and(s, (root, q, cb) -> cb.equal(root.get("hidden"), false));

        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent("isPublic", true));
            s = CommonSpecifications.and(s, (root, q, cb) -> cb.notEqual(root.get("status"), "temporary"));
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
