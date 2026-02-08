package com.jinyverse.backend.domain.user.repository;

import com.jinyverse.backend.domain.user.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, UUID> {

    Optional<Verification> findByEmailAndTypeAndDeletedAtIsNullAndIsVerifiedFalse(
            String email,
            String type
    );

    Optional<Verification> findByEmailAndTypeAndCodeAndDeletedAtIsNull(
            String email,
            String type,
            String code
    );
}
