package com.jinyverse.backend.domain.idempotency.repository;

import com.jinyverse.backend.domain.idempotency.entity.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, String> {

    @Modifying
    @Query("""
            DELETE FROM IdempotencyRecord r
            WHERE r.createdAt < :before
              AND r.status <> com.jinyverse.backend.domain.idempotency.entity.IdempotencyRecord$Status.PROCESSING
            """)
    int deleteCompletedOrFailedBefore(@Param("before") LocalDateTime before);
}
