package com.jinyverse.backend.domain.file.repository;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommonFileRepository extends JpaRepository<CommonFile, UUID>, JpaSpecificationExecutor<CommonFile> {
}
