package com.jinyverse.backend.domain.inquiry.repository;

import com.jinyverse.backend.domain.inquiry.entity.InquiryThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InquiryThreadRepository extends JpaRepository<InquiryThread, UUID> {
    List<InquiryThread> findByInquiryIdAndDeletedAtIsNull(UUID inquiryId);
}
