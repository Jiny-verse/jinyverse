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

    @Query(value = """
            SELECT f.*
            FROM common_file f
            WHERE f.created_at < :before
              AND NOT EXISTS (SELECT 1 FROM rel__topic_file rtf WHERE rtf.file_id = f.id)
              AND NOT EXISTS (SELECT 1 FROM rel__user_file ruf WHERE ruf.file_id = f.id)
              AND NOT EXISTS (SELECT 1 FROM rel__landing_section_file rlsf WHERE rlsf.file_id = f.id)
              AND NOT EXISTS (
                SELECT 1
                FROM landing_cta lc
                WHERE lc.image_file_id = f.id
                  AND lc.deleted_at IS NULL
              )
              AND NOT EXISTS (
                SELECT 1
                FROM landing_section ls
                WHERE ls.deleted_at IS NULL
                  AND ls.extra_config ->> 'darkFileId' = f.id::text
              )
            """, nativeQuery = true)
    List<CommonFile> findOrphanFilesCreatedBefore(@Param("before") LocalDateTime before);

    @Query("SELECT f FROM CommonFile f WHERE f.thumbnailPath IS NULL AND f.mimeType IN :mimeTypes")
    List<CommonFile> findByThumbnailPathIsNullAndMimeTypeIn(@Param("mimeTypes") List<String> mimeTypes);

    long countByMimeTypeIn(List<String> mimeTypes);

    long countByThumbnailPathIsNotNullAndMimeTypeIn(List<String> mimeTypes);
}
