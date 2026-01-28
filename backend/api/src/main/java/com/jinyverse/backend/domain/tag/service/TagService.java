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

import java.util.UUID;

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

    public Page<TagResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return tagRepository.findAll(spec(ctx), pageable).map(Tag::toResponseDto);
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
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Tag> spec(RequestContext ctx) {
        return (root, query, cb) -> cb.conjunction();
    }
}
