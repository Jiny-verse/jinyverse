package com.jinyverse.backend.domain.landing.repository;

import com.jinyverse.backend.domain.landing.entity.LandingSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandingSectionRepository extends JpaRepository<LandingSection, UUID> {

    Optional<LandingSection> findByIdAndDeletedAtIsNull(UUID id);

    List<LandingSection> findAllByDeletedAtIsNullOrderByOrderAsc();

    List<LandingSection> findAllByIsActiveTrueAndDeletedAtIsNullOrderByOrderAsc();
}
