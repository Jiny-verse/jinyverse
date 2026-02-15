package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.comment.entity.Comment;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import com.jinyverse.backend.domain.tag.entity.Tag;
import com.jinyverse.backend.domain.tag.repository.TagRepository;
import com.jinyverse.backend.domain.topic.dto.RelTopicFileDto;
import com.jinyverse.backend.domain.topic.dto.TopicFileItemDto;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicFile;
import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;
    private final RelTopicFileRepository relTopicFileRepository;
    private final CommonFileRepository commonFileRepository;
    private final RelTopicTagRepository relTopicTagRepository;
    private final TagRepository tagRepository;
    private final AuditLogHelper auditLogHelper;

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
        saveTopicTags(saved.getId(), requestDto.getTagIds());
        saveTopicFiles(saved.getId(), requestDto.getFiles());
        TopicResponseDto dto = toResponseDtoWithTags(saved.getId(), saved.toResponseDto());
        auditLogHelper.log("TOPIC", saved.getId(), "CREATE", null, dto);
        return dto;
    }

    @Transactional(readOnly = false)
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
            // 외부 채널에서 상세 조회 시 조회수 증가
            topic.setViewCount((topic.getViewCount() != null ? topic.getViewCount() : 0) + 1);
            topicRepository.save(topic);
        }
        return toResponseDtoWithTags(id, topic.toResponseDto());
    }

    public Page<TopicResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        Page<TopicResponseDto> page = topicRepository.findAll(spec(ctx, filter), pageable).map(Topic::toResponseDto);
        fillTagsForPage(page);
        fillFilesForPage(page);
        return page;
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

        TopicResponseDto before = toResponseDtoWithTags(id, topic.toResponseDto());

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
        saveTopicTags(updated.getId(), requestDto.getTagIds());
        saveTopicFiles(updated.getId(), requestDto.getFiles());
        TopicResponseDto after = toResponseDtoWithTags(updated.getId(), updated.toResponseDto());
        auditLogHelper.log("TOPIC", id, "UPDATE", before, after);
        return after;
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
        saveTopicTags(saved.getId(), requestDto.getTagIds());
        saveTopicFiles(saved.getId(), requestDto.getFiles());
        return toResponseDtoWithTags(saved.getId(), saved.toResponseDto());
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
        return toResponseDtoWithTags(savedDraft.getId(), savedDraft.toResponseDto());
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic delete requires ADMIN on INTERNAL channel");
        }
        Topic topic = topicRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));

        TopicResponseDto before = toResponseDtoWithTags(id, topic.toResponseDto());
        relTopicFileRepository.deleteByTopicId(id);
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
            if (PAGINATION_KEYS.contains(key))
                continue;
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

    private void saveTopicTags(UUID topicId, List<UUID> tagIds) {
        relTopicTagRepository.findByTopicId(topicId).forEach(relTopicTagRepository::delete);
        if (tagIds != null && !tagIds.isEmpty()) {
            for (UUID tagId : tagIds) {
                relTopicTagRepository.save(RelTopicTag.builder().topicId(topicId).tagId(tagId).build());
            }
        }
    }

    private TopicResponseDto toResponseDtoWithTags(UUID topicId, TopicResponseDto dto) {
        List<RelTopicTag> rels = relTopicTagRepository.findByTopicId(topicId);
        if (rels.isEmpty()) {
            dto.setTags(List.of());
        } else {
            List<UUID> tagIds = rels.stream().map(RelTopicTag::getTagId).distinct().toList();
            List<Tag> tags = tagRepository.findAllById(tagIds);
            dto.setTags(tags.stream().map(Tag::toResponseDto).toList());
        }
        List<RelTopicFile> fileRels = relTopicFileRepository.findByTopicId(topicId);
        dto.setFiles(fileRels.stream().map(RelTopicFile::toDto).toList());
        return dto;
    }

    private void fillTagsForPage(Page<TopicResponseDto> page) {
        List<TopicResponseDto> content = page.getContent();
        if (content.isEmpty())
            return;
        List<UUID> topicIds = content.stream().map(TopicResponseDto::getId).filter(Objects::nonNull).toList();
        if (topicIds.isEmpty())
            return;
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

    private void saveTopicFiles(UUID topicId, List<TopicFileItemDto> files) {
        relTopicFileRepository.findByTopicId(topicId).forEach(relTopicFileRepository::delete);
        if (files == null || files.isEmpty())
            return;
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

    private void fillFilesForPage(Page<TopicResponseDto> page) {
        List<TopicResponseDto> content = page.getContent();
        if (content.isEmpty())
            return;
        List<UUID> topicIds = content.stream().map(TopicResponseDto::getId).filter(Objects::nonNull).toList();
        if (topicIds.isEmpty())
            return;
        List<RelTopicFile> rels = relTopicFileRepository.findByTopicIdIn(topicIds);
        Map<UUID, List<RelTopicFileDto>> topicToFiles = rels.stream()
                .collect(Collectors.groupingBy(RelTopicFile::getTopicId,
                        Collectors.mapping(RelTopicFile::toDto, Collectors.toList())));
        for (TopicResponseDto dto : content) {
            dto.setFiles(topicToFiles.getOrDefault(dto.getId(), List.of()));
        }
    }
}
