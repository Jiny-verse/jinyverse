package com.jinyverse.backend.domain.comment.repository;

import com.jinyverse.backend.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID>, JpaSpecificationExecutor<Comment> {

    @EntityGraph(attributePaths = "user")
    Optional<Comment> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = "user")
    Page<Comment> findAll(Specification<Comment> spec, Pageable pageable);

    List<Comment> findByTopicId(UUID topicId);

    List<Comment> findByUpperCommentIdAndDeletedAtIsNull(UUID upperCommentId);
}
