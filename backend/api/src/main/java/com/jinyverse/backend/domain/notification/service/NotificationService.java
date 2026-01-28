package com.jinyverse.backend.domain.notification.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.notification.dto.NotificationRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationResponseDto;
import com.jinyverse.backend.domain.notification.entity.Notification;
import com.jinyverse.backend.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponseDto create(NotificationRequestDto requestDto) {
        Notification notification = Notification.fromRequestDto(requestDto);
        Notification saved = notificationRepository.save(notification);
        return saved.toResponseDto();
    }

    public NotificationResponseDto getById(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return notification.toResponseDto();
    }

    public Page<NotificationResponseDto> getAll(UUID userId, Pageable pageable, RequestContext ctx) {
        Specification<Notification> spec = spec(ctx);
        if (userId != null) {
            spec = spec.and(CommonSpecifications.eqIfPresent("userId", userId));
        }
        
        return notificationRepository.findAll(spec, pageable).map(Notification::toResponseDto);
    }

    @Transactional
    public NotificationResponseDto update(UUID id, NotificationRequestDto requestDto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.applyUpdate(requestDto);
        Notification updated = notificationRepository.save(notification);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Notification> spec(RequestContext ctx) {
        return CommonSpecifications.notDeleted();
    }
}
