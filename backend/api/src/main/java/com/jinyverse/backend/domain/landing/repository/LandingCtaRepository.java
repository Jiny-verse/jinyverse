package com.jinyverse.backend.domain.landing.repository;

import com.jinyverse.backend.domain.landing.entity.LandingCta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandingCtaRepository extends JpaRepository<LandingCta, UUID> {

    Optional<LandingCta> findByIdAndDeletedAtIsNull(UUID id);

    List<LandingCta> findAllBySectionIdAndDeletedAtIsNullOrderByOrderAsc(UUID sectionId);
}
