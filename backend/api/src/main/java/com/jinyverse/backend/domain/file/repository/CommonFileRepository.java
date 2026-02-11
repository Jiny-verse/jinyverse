package com.jinyverse.backend.domain.file.repository;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommonFileRepository extends JpaRepository<CommonFile, UUID>, JpaSpecificationExecutor<CommonFile> {

    @Query("""
            SELECT f FROM CommonFile f
            WHERE (f.sessionId IS NOT NULL AND f.createdAt < :before)
               OR (f.sessionId IS NULL
                   AND NOT EXISTS (SELECT r FROM RelTopicFile r WHERE r.fileId = f.id)
                   AND NOT EXISTS (SELECT u FROM RelUserFile u WHERE u.fileId = f.id))
            """)
    List<CommonFile> findOrphanFilesCreatedBefore(@Param("before") LocalDateTime before);
}
