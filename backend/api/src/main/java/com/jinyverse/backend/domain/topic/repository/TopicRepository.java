package com.jinyverse.backend.domain.topic.repository;

import com.jinyverse.backend.domain.topic.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic> {
    Optional<Topic> findByIdAndDeletedAtIsNull(UUID id);
    
    long countByDeletedAtIsNull();
}
