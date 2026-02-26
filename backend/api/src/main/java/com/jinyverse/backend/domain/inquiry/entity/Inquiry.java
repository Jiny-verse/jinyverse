package com.jinyverse.backend.domain.inquiry.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.inquiry.dto.InquiryResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inquiry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    /** 티켓 번호 (INQ-YYYYMMDD-0001) */
    @Column(name = "ticket_no", length = 30, nullable = false, unique = true)
    private String ticketNo;

    /** 회원 ID (비회원이면 null) */
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    /** 비회원 이메일 */
    @Column(name = "guest_email", length = 255)
    private String guestEmail;

    /** 카테고리 코드 */
    @Column(name = "category_code", length = 40, nullable = false)
    private String categoryCode;

    /** 제목 */
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    /** 상태 코드 */
    @Column(name = "status_code", length = 40, nullable = false)
    private String statusCode;

    /** 우선순위 코드 */
    @Column(name = "priority_code", length = 40, nullable = false)
    private String priorityCode;

    /** 담당자 ID */
    @Column(name = "assignee_id", columnDefinition = "UUID")
    private UUID assigneeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id", insertable = false, updatable = false)
    private User assignee;

    public InquiryResponseDto toResponseDto() {
        return InquiryResponseDto.builder()
                .id(this.id)
                .ticketNo(this.ticketNo)
                .userId(this.userId)
                .guestEmail(this.guestEmail)
                .categoryCode(this.categoryCode)
                .title(this.title)
                .statusCode(this.statusCode)
                .priorityCode(this.priorityCode)
                .assigneeId(this.assigneeId)
                .assigneeName(this.assignee != null ? this.assignee.getName() : null)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .build();
    }
}
