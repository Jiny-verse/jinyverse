package com.jinyverse.backend.domain.tag.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.tag.dto.TagRequestDto;
import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import com.jinyverse.backend.domain.tag.entity.Tag;
import com.jinyverse.backend.domain.tag.repository.TagRepository;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;
    private final RelTopicTagRepository relTopicTagRepository;
    private final AuditLogHelper auditLogHelper;

    @Transactional
    public TagResponseDto create(TagRequestDto requestDto) {
        Tag tag = Tag.fromRequestDto(requestDto);
        Tag saved = tagRepository.save(tag);
        TagResponseDto dto = saved.toResponseDto();
        auditLogHelper.log("TAG", saved.getId(), "CREATE", null, dto);
        return dto;
    }

    public TagResponseDto getById(UUID id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
        return tag.toResponseDto();
    }

    public Page<TagResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return tagRepository.findAll(spec(ctx, filter), pageable).map(Tag::toResponseDto);
    }

    @Transactional
    public TagResponseDto update(UUID id, TagRequestDto requestDto) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));

        TagResponseDto before = tag.toResponseDto();
        tag.applyUpdate(requestDto);
        Tag updated = tagRepository.save(tag);
        TagResponseDto after = updated.toResponseDto();
        auditLogHelper.log("TAG", id, "UPDATE", before, after);
        return after;
    }

    @Transactional
    public void delete(UUID id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
        TagResponseDto before = tag.toResponseDto();
        relTopicTagRepository.deleteByTagId(id);
        tagRepository.delete(tag);
        auditLogHelper.log("TAG", id, "DELETE", before, null);
    }

    private Specification<Tag> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                (root, query, cb) -> cb.conjunction(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q",
                        new String[] { "name", "description", "usageCategoryCode", "usage" }));
    }
}
