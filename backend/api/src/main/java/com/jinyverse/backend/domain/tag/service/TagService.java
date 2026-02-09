package com.jinyverse.backend.domain.tag.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.tag.dto.TagRequestDto;
import com.jinyverse.backend.domain.tag.dto.TagResponseDto;
import com.jinyverse.backend.domain.tag.entity.Tag;
import com.jinyverse.backend.domain.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public TagResponseDto create(TagRequestDto requestDto) {
        Tag tag = Tag.fromRequestDto(requestDto);
        Tag saved = tagRepository.save(tag);
        return saved.toResponseDto();
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

        tag.applyUpdate(requestDto);
        Tag updated = tagRepository.save(tag);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
        tagRepository.delete(tag);
    }

    /**
     * 쿼리 파라미터 필터: q(이름·설명 검색)
     */
    private Specification<Tag> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                (root, query, cb) -> cb.conjunction(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"name", "description"})
        );
    }
}
