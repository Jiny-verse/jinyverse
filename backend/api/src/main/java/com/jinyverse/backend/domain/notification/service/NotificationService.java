package com.jinyverse.backend.domain.notification.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import com.jinyverse.backend.domain.notification.dto.NotificationRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationResponseDto;
import com.jinyverse.backend.domain.notification.entity.Notification;
import com.jinyverse.backend.domain.notification.entity.NotificationSetting;
import com.jinyverse.backend.domain.notification.repository.NotificationRepository;
import com.jinyverse.backend.domain.notification.repository.NotificationSettingRepository;
import com.jinyverse.backend.domain.notification.repository.NotificationTemplateRepository;
import com.jinyverse.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.jinyverse.backend.exception.ForbiddenException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingRepository settingRepository;
    private final NotificationTemplateRepository templateRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationResponseDto create(NotificationRequestDto requestDto) {
        Notification notification = Notification.fromRequestDto(requestDto);
        Notification saved = notificationRepository.save(notification);
        return saved.toResponseDto();
    }

    public NotificationResponseDto getById(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        return notification.toResponseDto();
    }

    public Page<NotificationResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return notificationRepository.findAll(spec(ctx, filter), pageable).map(Notification::toResponseDto);
    }

    @Transactional
    public NotificationResponseDto update(UUID id, NotificationRequestDto requestDto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));

        notification.applyUpdate(requestDto);
        Notification updated = notificationRepository.save(notification);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));

        notification.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * 알림 발송 (시스템/이메일 분기 처리)
     */
    @Transactional
    public void sendToUser(UUID userId, String type, String message, String link, UUID templateId) {
        if (userId == null) return;

        NotificationSetting setting = settingRepository.findByUserId(userId)
                .orElse(defaultSetting(userId));

        if (!Boolean.TRUE.equals(setting.getSystemEnabled())) return;

        String resolvedMessage = resolveMessage(templateId, message, Map.of("message", message, "link", link != null ? link : ""));

        Notification notification = Notification.builder()
                .userId(userId)
                .typeCategoryCode("notification_type")
                .type(type)
                .message(resolvedMessage)
                .link(link)
                .isRead(false)
                .sendEmail(Boolean.TRUE.equals(setting.getEmailEnabled()))
                .emailSent(false)
                .templateId(templateId)
                .build();
        notificationRepository.save(notification);

        if (Boolean.TRUE.equals(setting.getEmailEnabled())) {
            String toEmail = setting.getEmailOverride() != null
                    ? setting.getEmailOverride()
                    : userRepository.findById(userId).map(u -> u.getEmail()).orElse(null);

            if (toEmail != null) {
                // Email dispatch placeholder — replace with actual mail service call
                notification.setEmailSent(true);
                notification.setEmailSentAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        }
    }

    /** 단건 읽음 처리 */
    @Transactional
    public NotificationResponseDto markAsRead(UUID id, UUID currentUserId) {
        Notification item = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (currentUserId != null && !currentUserId.equals(item.getUserId())) {
            throw new ForbiddenException("Not authorized to mark this notification as read");
        }
        item.setIsRead(true);
        item.setReadAt(LocalDateTime.now());
        return notificationRepository.save(item).toResponseDto();
    }

    /** 전체 읽음 처리 */
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    /** 미읽음 카운트 */
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalseAndDeletedAtIsNull(userId);
    }

    private String resolveMessage(UUID templateId, String fallback, Map<String, String> vars) {
        if (templateId == null) return fallback;
        return templateRepository.findById(templateId)
                .map(t -> t.renderBody(vars != null ? vars : Map.of()))
                .orElse(fallback);
    }

    private NotificationSetting defaultSetting(UUID userId) {
        return NotificationSetting.builder()
                .userId(userId)
                .systemEnabled(true)
                .emailEnabled(false)
                .build();
    }

    /**
     * 삭제 여부 + 쿼리 파라미터 필터 (userId, q 등).
     * 비관리자는 자신의 알림만 조회할 수 있도록 userId를 강제 적용.
     */
    private Specification<Notification> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<Notification> base = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{})
        );
        // 관리자가 아닌 경우 반드시 본인 알림만 조회
        if (!ctx.isAdmin() && ctx.getCurrentUserId() != null) {
            base = CommonSpecifications.and(
                    base,
                    CommonSpecifications.eqIfPresent("userId", ctx.getCurrentUserId())
            );
        }
        return base;
    }
}
