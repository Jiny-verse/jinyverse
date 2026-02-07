package com.jinyverse.backend.domain.comment.service;

import com.jinyverse.backend.domain.comment.dto.CommentRequestDto;
import com.jinyverse.backend.domain.comment.dto.CommentResponseDto;
import com.jinyverse.backend.domain.comment.entity.Comment;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public CommentResponseDto create(CommentRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.hasRole()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Comment create requires logged-in user (USER or ADMIN)");
        }
        Comment comment = Comment.fromRequestDto(requestDto);
        Comment saved = commentRepository.save(comment);
        return saved.toResponseDto();
    }

    public CommentResponseDto getById(UUID id) {
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        return comment.toResponseDto();
    }

    public Page<CommentResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return commentRepository.findAll(spec(ctx, filter), pageable).map(Comment::toResponseDto);
    }

    @Transactional
    public CommentResponseDto update(UUID id, CommentRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.hasRole()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Comment update requires logged-in user (USER or ADMIN)");
        }
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

        comment.applyUpdate(requestDto);
        Comment updated = commentRepository.save(comment);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Comment delete requires ADMIN");
        }
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    private Specification<Comment> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<Comment> s = CommonSpecifications.notDeleted();
        // q(검색)는 Comment 도메인에서 미지원 - 스킵 (eq 필드가 없음)
        for (Map.Entry<String, Object> entry : filter.entrySet()) {
            String key = entry.getKey();
            if (PAGINATION_KEYS.contains(key) || "q".equals(key)) continue;
            s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent(key, entry.getValue()));
        }
        return s;
    }
}
