package com.jinyverse.backend.domain.topic.repository;

import com.jinyverse.backend.domain.topic.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic> {

    @EntityGraph(attributePaths = "author")
    Optional<Topic> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = "author")
    Page<Topic> findAll(Specification<Topic> spec, Pageable pageable);

    long countByDeletedAtIsNull();

    List<Topic> findByBoardIdAndDeletedAtIsNull(UUID boardId);
}
