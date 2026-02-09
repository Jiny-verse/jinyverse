package com.jinyverse.backend.domain.comment.repository;

import com.jinyverse.backend.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID>, JpaSpecificationExecutor<Comment> {
    Optional<Comment> findByIdAndDeletedAtIsNull(UUID id);

    List<Comment> findByTopicId(UUID topicId);
}
