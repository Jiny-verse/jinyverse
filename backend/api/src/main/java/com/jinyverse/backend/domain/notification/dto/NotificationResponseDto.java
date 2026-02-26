package com.jinyverse.backend.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {

    /** 알림 ID */
    private UUID id;
    /** 수신 사용자 ID */
    private UUID userId;
    /** 알림 타입 분류 */
    private String typeCategoryCode;
    /** 알림 타입 코드 (COMMENT, REPLY, SYSTEM 등) */
    private String type;
    /** 알림 메시지 */
    private String message;
    /** 이동 링크 */
    private String link;
    /** 읽음 여부 */
    private Boolean isRead;
    /** 이메일 발송 여부 */
    private Boolean sendEmail;
    /** 이메일 발송 완료 여부 */
    private Boolean emailSent;
    /** 생성일 */
    private LocalDateTime createdAt;
    /** 읽은 시점 */
    private LocalDateTime readAt;
}
