package com.jinyverse.backend.domain.inquiry.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inquiry_thread")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryThread extends BaseEntity {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(name = "inquiry_id", columnDefinition = "UUID", nullable = false)
    private UUID inquiryId;

    /** 작성자 ID (비회원이면 null) */
    @Column(name = "author_id", columnDefinition = "UUID")
    private UUID authorId;

    /** 비회원 작성자 이메일 */
    @Column(name = "author_email", length = 255)
    private String authorEmail;

    /** 스레드 타입 코드 */
    @Column(name = "type_code", length = 40, nullable = false)
    private String typeCode;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_from_email", length = 255)
    private String sentFromEmail;

    @Column(name = "sent_to_email", length = 255)
    private String sentToEmail;

    @Builder.Default
    @Column(name = "email_sent", nullable = false)
    private Boolean emailSent = false;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", insertable = false, updatable = false)
    private Inquiry inquiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    private User author;

    public InquiryThreadResponseDto toResponseDto() {
        return InquiryThreadResponseDto.builder()
                .id(this.id)
                .inquiryId(this.inquiryId)
                .authorId(this.authorId)
                .authorEmail(this.authorEmail)
                .authorName(this.author != null ? this.author.getName() : null)
                .typeCode(this.typeCode)
                .content(this.content)
                .emailSent(Boolean.TRUE.equals(this.emailSent))
                .createdAt(this.getCreatedAt())
                .build();
    }
}
