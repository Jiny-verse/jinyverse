package com.jinyverse.backend.domain.notification.entity;

import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.notification.dto.NotificationRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    /** 알림 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 수신 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    private UUID userId;

    /**
     * 알림 타입 분류 코드
     * 값: notification_type
     */
    @Column(name = "type_category_code", length = 40, nullable = false)
    private String typeCategoryCode;

    /**
     * 알림 타입 코드
     * 값: comment, reply, system
     */
    @Column(name = "type", length = 40, nullable = false)
    private String type;

    /** 알림 메시지 */
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    /** 이동 링크 */
    @Column(name = "link", columnDefinition = "TEXT")
    private String link;

    /** 읽음 여부 */
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    /** 읽은 시점 */
    @Column(name = "read_at")
    private LocalDateTime readAt;

    /** 이메일도 발송해야 하는지 여부 */
    @Builder.Default
    @Column(name = "send_email", nullable = false)
    private Boolean sendEmail = false;

    /** 이메일 발송 완료 여부 */
    @Builder.Default
    @Column(name = "email_sent", nullable = false)
    private Boolean emailSent = false;

    /** 이메일 발송 시각 */
    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    /** 사용된 템플릿 ID */
    @Column(name = "template_id", columnDefinition = "UUID")
    private UUID templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_category_code", insertable = false, updatable = false)
    private CodeCategory typeCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "type_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "type", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code typeCode;

    public static Notification fromRequestDto(NotificationRequestDto dto) {
        if (dto == null)
            throw new IllegalArgumentException("NotificationRequestDto is null");
        return Notification.builder()
                .userId(dto.getUserId())
                .typeCategoryCode(dto.getTypeCategoryCode() != null ? dto.getTypeCategoryCode() : "notification_type")
                .type(dto.getType())
                .message(dto.getMessage())
                .link(dto.getLink())
                .build();
    }

    public void applyUpdate(NotificationRequestDto dto) {
        if (dto == null)
            return;
        if (dto.getTypeCategoryCode() != null)
            this.typeCategoryCode = dto.getTypeCategoryCode();
        if (dto.getType() != null)
            this.type = dto.getType();
        if (dto.getMessage() != null)
            this.message = dto.getMessage();
        if (dto.getLink() != null)
            this.link = dto.getLink();
    }

    public NotificationRequestDto toDto() {
        return NotificationRequestDto.builder()
                .userId(this.userId)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .message(this.message)
                .link(this.link)
                .build();
    }

    public NotificationResponseDto toResponseDto() {
        return NotificationResponseDto.builder()
                .id(this.id)
                .userId(this.userId)
                .typeCategoryCode(this.typeCategoryCode)
                .type(this.type)
                .message(this.message)
                .link(this.link)
                .isRead(this.isRead)
                .sendEmail(this.sendEmail)
                .emailSent(this.emailSent)
                .createdAt(this.getCreatedAt())
                .readAt(this.readAt)
                .build();
    }
}
