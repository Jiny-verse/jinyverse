package com.jinyverse.backend.domain.user.repository;

import com.jinyverse.backend.domain.user.entity.UserAuthCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAuthCountRepository extends JpaRepository<UserAuthCount, UUID> {

    Optional<UserAuthCount> findByEmailAndTypeCategoryCodeAndTypeAndDeletedAtIsNull(
            String email,
            String typeCategoryCode,
            String type
    );
}
