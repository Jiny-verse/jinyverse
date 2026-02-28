package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.comment.entity.Comment;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.jinyverse.backend.exception.ForbiddenException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;
    private final RelTopicTagRepository relTopicTagRepository;
    private final AuditLogHelper auditLogHelper;
    private final TopicTagService topicTagService;
    private final TopicFileService topicFileService;

    @Transactional
    public TopicResponseDto create(TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Topic create requires ADMIN on INTERNAL channel");
        }
        Topic topic = Topic.fromRequestDto(requestDto);
        if ("temporary".equals(requestDto.getStatus())) {
            topic.setIsPublic(false);
        }
        Topic saved = topicRepository.save(topic);
        topicTagService.saveTopicTags(saved.getId(), requestDto.getTagIds());
        topicFileService.saveTopicFiles(saved.getId(), requestDto.getFiles());
        TopicResponseDto dto = toResponseDtoWithTagsAndFiles(saved.getId(), saved.toResponseDto());
        auditLogHelper.log("TOPIC", saved.getId(), "CREATE", null, dto);
        return dto;
    }

    @Transactional(readOnly = false)
    public TopicResponseDto getById(UUID id, RequestContext ctx) {
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));
        if (ctx != null && ctx.getChannel() == Channel.EXTERNAL) {
            boolean privateOrDraft = !Boolean.TRUE.equals(topic.getIsPublic()) || "temporary".equals(topic.getStatus());
            if (privateOrDraft) {
                boolean allowed = ctx.getUserId() != null
                        && (topic.getAuthorUserId().equals(ctx.getUserId()) || ctx.isAdmin());
                if (!allowed) {
                    throw new ForbiddenException("Access denied to this topic");
                }
            }
            // 외부 채널에서 상세 조회 시 조회수 증가
            topic.setViewCount((topic.getViewCount() != null ? topic.getViewCount() : 0) + 1);
            topicRepository.save(topic);
        }
        return toResponseDtoWithTagsAndFiles(id, topic.toResponseDto());
    }

    public Page<TopicResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        Page<TopicResponseDto> page = topicRepository.findAll(spec(ctx, filter), pageable).map(Topic::toResponseDto);
        topicTagService.fillTagsForPage(page);
        topicFileService.fillFilesForPage(page);
        return page;
    }

    public long count() {
        return topicRepository.count(spec(null, Map.of()));
    }

    @Transactional
    public TopicResponseDto update(UUID id, TopicRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Topic update requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));

        TopicResponseDto before = toResponseDtoWithTagsAndFiles(id, topic.toResponseDto());

        if (topic.getSourceTopicId() != null && "created".equals(requestDto.getStatus())) {
            TopicResponseDto after = promoteDraft(topic, requestDto);
            auditLogHelper.log("TOPIC", after.getId(), "UPDATE", before, after);
            return after;
        }
        if (topic.getSourceTopicId() == null && Boolean.FALSE.equals(topic.getHidden())
                && "temporary".equals(requestDto.getStatus())) {
            TopicResponseDto after = createDraftAndHideOriginal(topic, requestDto);
            auditLogHelper.log("TOPIC", id, "UPDATE", before, after);
            return after;
        }

        topic.applyUpdate(requestDto);
        if ("temporary".equals(topic.getStatus())) {
            topic.setIsPublic(false);
        }
        Topic updated = topicRepository.save(topic);
        topicTagService.saveTopicTags(updated.getId(), requestDto.getTagIds());
        topicFileService.saveTopicFiles(updated.getId(), requestDto.getFiles());
        TopicResponseDto after = toResponseDtoWithTagsAndFiles(updated.getId(), updated.toResponseDto());
        auditLogHelper.log("TOPIC", id, "UPDATE", before, after);
        return after;
    }

    private TopicResponseDto promoteDraft(Topic draft, TopicRequestDto requestDto) {
        UUID originalId = draft.getSourceTopicId();
        UUID draftId = draft.getId();

        List<Comment> comments = commentRepository.findByTopicId(originalId);
        comments.forEach(c -> c.setTopicId(draftId));
        commentRepository.saveAll(comments);

        topicFileService.moveFilesToTopic(originalId, draftId);

        List<RelTopicTag> tags = relTopicTagRepository.findByTopicId(originalId);
        tags.forEach(t -> t.setTopicId(draftId));
        relTopicTagRepository.saveAll(tags);

        Topic original = topicRepository.findByIdAndDeletedAtIsNull(originalId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", originalId));
        original.setDeletedAt(LocalDateTime.now());
        topicRepository.save(original);

        draft.setSourceTopicId(null);
        draft.setStatus("created");
        draft.applyUpdate(requestDto);
        Topic saved = topicRepository.save(draft);
        topicTagService.saveTopicTags(saved.getId(), requestDto.getTagIds());
        topicFileService.saveTopicFiles(saved.getId(), requestDto.getFiles());
        return toResponseDtoWithTagsAndFiles(saved.getId(), saved.toResponseDto());
    }

    private TopicResponseDto createDraftAndHideOriginal(Topic original, TopicRequestDto requestDto) {
        Topic draft = Topic.draftOf(original, requestDto);
        Topic savedDraft = topicRepository.save(draft);
        original.setHidden(true);
        topicRepository.save(original);
        List<RelTopicTag> originalTags = relTopicTagRepository.findByTopicId(original.getId());
        for (RelTopicTag rel : originalTags) {
            relTopicTagRepository.save(RelTopicTag.builder().topicId(savedDraft.getId()).tagId(rel.getTagId()).build());
        }
        return toResponseDtoWithTagsAndFiles(savedDraft.getId(), savedDraft.toResponseDto());
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Topic delete requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));

        TopicResponseDto before = toResponseDtoWithTagsAndFiles(id, topic.toResponseDto());
        topicFileService.deleteByTopicId(id);
        relTopicTagRepository.deleteByTopicId(id);
        topic.setDeletedAt(LocalDateTime.now());
        topicRepository.save(topic);
        auditLogHelper.log("TOPIC", id, "DELETE", before, null);
    }

    private Specification<Topic> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<Topic> s = CommonSpecifications.notDeleted();
        s = CommonSpecifications.and(s, (root, q, cb) -> cb.equal(root.get("hidden"), false));

        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            if (!ctx.hasRole()) {
                s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent("isPublic", true));
            }
            s = CommonSpecifications.and(s, (root, q, cb) -> cb.notEqual(root.get("status"), "temporary"));
        }

        for (Map.Entry<String, Object> entry : filter.entrySet()) {
            String key = entry.getKey();
            if (PAGINATION_KEYS.contains(key)) continue;
            Object value = entry.getValue();
            if ("q".equals(key)) {
                s = CommonSpecifications.and(s,
                        CommonSpecifications.keywordLikeAny((String) value, "title", "content"));
            } else {
                s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent(key, value));
            }
        }

        return s;
    }

    private TopicResponseDto toResponseDtoWithTagsAndFiles(UUID topicId, TopicResponseDto dto) {
        topicTagService.fillTagsForSingle(topicId, dto);
        dto.setFiles(topicFileService.getFilesForTopic(topicId));
        return dto;
    }
}
