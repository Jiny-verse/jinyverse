package com.jinyverse.backend.domain.user.repository;

import com.jinyverse.backend.domain.user.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByRefreshTokenAndDeletedAtIsNull(String refreshToken);

    List<UserSession> findByUserIdAndDeletedAtIsNull(UUID userId);
}
