package com.jinyverse.backend.domain.inquiry.repository;

import com.jinyverse.backend.domain.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID>, JpaSpecificationExecutor<Inquiry> {
    Optional<Inquiry> findByIdAndUserId(UUID id, UUID userId);
}
