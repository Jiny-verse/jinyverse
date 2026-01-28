package com.jinyverse.backend.domain.comment.service;

import com.jinyverse.backend.domain.comment.dto.CommentRequestDto;
import com.jinyverse.backend.domain.comment.dto.CommentResponseDto;
import com.jinyverse.backend.domain.comment.entity.Comment;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
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
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public CommentResponseDto create(CommentRequestDto requestDto) {
        Comment comment = Comment.fromRequestDto(requestDto);
        Comment saved = commentRepository.save(comment);
        return saved.toResponseDto();
    }

    public CommentResponseDto getById(UUID id) {
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        return comment.toResponseDto();
    }

    public Page<CommentResponseDto> getAll(UUID topicId, Pageable pageable, RequestContext ctx) {
        Specification<Comment> spec = spec(ctx);
        if (topicId != null) {
            spec = spec.and(CommonSpecifications.eqIfPresent("topicId", topicId));
        }
        
        return commentRepository.findAll(spec, pageable).map(Comment::toResponseDto);
    }

    @Transactional
    public CommentResponseDto update(UUID id, CommentRequestDto requestDto) {
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

        comment.applyUpdate(requestDto);
        Comment updated = commentRepository.save(comment);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Comment> spec(RequestContext ctx) {
        return CommonSpecifications.notDeleted();
    }
}
