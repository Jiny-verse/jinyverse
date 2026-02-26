package com.jinyverse.backend.domain.notification.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.notification.dto.NotificationTemplateRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationTemplateResponseDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "notification_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate extends BaseEntity {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    /** 템플릿 이름 */
    @Column(name = "name", length = 255, nullable = false)
    private String name;

    /** 발송 채널 (system/email/both) */
    @Column(name = "channel", length = 40, nullable = false)
    private String channel;

    /** 이메일 제목 */
    @Column(name = "email_subject", length = 255)
    private String emailSubject;

    /** 본문 ({{variable}} 치환 지원) */
    @Column(name = "body", columnDefinition = "TEXT", nullable = false)
    private String body;

    /** 지원 변수 목록 */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variables", columnDefinition = "jsonb")
    private List<String> variables;

    /** 설명 */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** 본문 변수 치환 */
    public String renderBody(Map<String, String> values) {
        String rendered = this.body;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            rendered = rendered.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return rendered;
    }

    /** 이메일 제목 변수 치환 */
    public String renderSubject(Map<String, String> values) {
        if (this.emailSubject == null) return "";
        String rendered = this.emailSubject;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            rendered = rendered.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return rendered;
    }

    public static NotificationTemplate fromRequestDto(NotificationTemplateRequestDto dto) {
        return NotificationTemplate.builder()
                .name(dto.getName())
                .channel(dto.getChannel())
                .emailSubject(dto.getEmailSubject())
                .body(dto.getBody())
                .variables(dto.getVariables() != null ? dto.getVariables() : List.of())
                .description(dto.getDescription())
                .build();
    }

    public void applyUpdate(NotificationTemplateRequestDto dto) {
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getChannel() != null) this.channel = dto.getChannel();
        if (dto.getEmailSubject() != null) this.emailSubject = dto.getEmailSubject();
        if (dto.getBody() != null) this.body = dto.getBody();
        if (dto.getVariables() != null) this.variables = dto.getVariables();
        if (dto.getDescription() != null) this.description = dto.getDescription();
    }

    public NotificationTemplateResponseDto toResponseDto() {
        return NotificationTemplateResponseDto.builder()
                .id(this.id)
                .name(this.name)
                .channel(this.channel)
                .emailSubject(this.emailSubject)
                .body(this.body)
                .variables(this.variables)
                .description(this.description)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .build();
    }
}
