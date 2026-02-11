package com.jinyverse.backend.domain.user.repository;

import com.jinyverse.backend.domain.user.entity.RelUserFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelUserFileRepository extends JpaRepository<RelUserFile, UUID> {

    List<RelUserFile> findByUserId(UUID userId);

    Optional<RelUserFile> findByUserIdAndUsage(UUID userId, String usage);

    void deleteByUserIdAndUsage(UUID userId, String usage);
    void deleteByUserId(UUID userId);
}
