package com.jinyverse.backend.domain.notification.repository;

import com.jinyverse.backend.domain.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID>, JpaSpecificationExecutor<NotificationTemplate> {
}
