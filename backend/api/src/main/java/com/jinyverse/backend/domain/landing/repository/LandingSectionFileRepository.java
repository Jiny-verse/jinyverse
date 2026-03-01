package com.jinyverse.backend.domain.landing.repository;

import com.jinyverse.backend.domain.landing.entity.LandingSectionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandingSectionFileRepository extends JpaRepository<LandingSectionFile, UUID> {

    List<LandingSectionFile> findAllBySectionIdOrderByOrderAsc(UUID sectionId);

    void deleteBySectionIdAndFileId(UUID sectionId, UUID fileId);
}
