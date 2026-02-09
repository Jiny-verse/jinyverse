package com.jinyverse.backend.domain.topic.repository;

import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelTopicTagRepository extends JpaRepository<RelTopicTag, UUID> {
    List<RelTopicTag> findByTopicId(UUID topicId);
}
