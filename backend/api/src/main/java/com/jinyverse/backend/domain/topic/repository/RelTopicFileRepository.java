package com.jinyverse.backend.domain.topic.repository;

import com.jinyverse.backend.domain.topic.entity.RelTopicFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelTopicFileRepository extends JpaRepository<RelTopicFile, UUID> {
    List<RelTopicFile> findByTopicId(UUID topicId);
    List<RelTopicFile> findByTopicIdIn(List<UUID> topicIds);
    List<RelTopicFile> findByFileId(UUID fileId);
    void deleteByTopicId(UUID topicId);
}
