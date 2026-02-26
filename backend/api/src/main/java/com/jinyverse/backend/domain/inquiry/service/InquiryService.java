package com.jinyverse.backend.domain.inquiry.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.inquiry.dto.InquiryRequestDto;
import com.jinyverse.backend.domain.inquiry.dto.InquiryResponseDto;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadResponseDto;
import com.jinyverse.backend.domain.inquiry.entity.Inquiry;
import com.jinyverse.backend.domain.inquiry.entity.InquiryThread;
import com.jinyverse.backend.domain.inquiry.repository.InquiryRepository;
import com.jinyverse.backend.domain.inquiry.repository.InquiryThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;
import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryThreadRepository threadRepository;
    private final JdbcTemplate jdbcTemplate;

    /** 티켓 번호 생성: INQ-YYYYMMDD-{4자리 seq} */
    private String generateTicketNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('inquiry_ticket_seq')", Long.class);
        return String.format("INQ-%s-%04d", date, seq);
    }

    /** 티켓 생성 */
    @Transactional
    public InquiryResponseDto create(InquiryRequestDto dto, RequestContext ctx) {
        UUID userId = ctx.isAuthenticated() ? ctx.getCurrentUserId() : null;
        boolean isGuest = (userId == null);
        if (isGuest && !hasText(dto.getGuestEmail())) {
            throw new IllegalArgumentException("비회원은 이메일이 필수입니다.");
        }

        Inquiry inquiry = Inquiry.builder()
                .ticketNo(generateTicketNo())
                .userId(userId)
                .guestEmail(isGuest ? dto.getGuestEmail() : null)
                .categoryCode(dto.getCategoryCode())
                .title(dto.getTitle())
                .statusCode("pending")
                .priorityCode("medium")
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        InquiryThread first = InquiryThread.builder()
                .inquiryId(saved.getId())
                .authorId(userId)
                .authorEmail(isGuest ? dto.getGuestEmail() : null)
                .typeCode("customer_message")
                .content(dto.getContent())
                .emailSent(false)
                .build();
        threadRepository.save(first);

        return saved.toResponseDto();
    }

    /** 관리자 목록 조회 */
    public Page<InquiryResponseDto> getAll(Map<String, Object> filter, Pageable pageable) {
        Set<String> skipKeys = Set.of("page", "size", "sort", "q");
        Specification<Inquiry> spec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"title"})
        );
        return inquiryRepository.findAll(spec, pageable).map(Inquiry::toResponseDto);
    }

    /** 관리자 상세 조회 (전체 스레드 포함) */
    public InquiryResponseDto getById(UUID id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        List<InquiryThreadResponseDto> threads = threadRepository
                .findByInquiryIdAndDeletedAtIsNull(id)
                .stream()
                .map(InquiryThread::toResponseDto)
                .toList();
        return inquiry.toResponseDto().withThreads(threads);
    }

    /** 회원 본인 목록 조회 */
    public Page<InquiryResponseDto> getMyInquiries(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        Specification<Inquiry> spec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.eqIfPresent("userId", ctx.getCurrentUserId())
        );
        return inquiryRepository.findAll(spec, pageable).map(Inquiry::toResponseDto);
    }

    /** 회원 본인 상세 조회 (internal_note 제외) */
    public InquiryResponseDto getMyInquiryById(UUID id, RequestContext ctx) {
        Inquiry inquiry = inquiryRepository.findByIdAndUserId(id, ctx.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        List<InquiryThreadResponseDto> publicThreads = threadRepository
                .findByInquiryIdAndDeletedAtIsNull(id)
                .stream()
                .filter(t -> !"internal_note".equals(t.getTypeCode()))
                .map(InquiryThread::toResponseDto)
                .toList();
        return inquiry.toResponseDto().withThreads(publicThreads);
    }

    /** 상태 변경 + status_change 스레드 자동 생성 */
    @Transactional
    public InquiryResponseDto updateStatus(UUID id, String newStatusCode, RequestContext ctx) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        String oldStatus = inquiry.getStatusCode();
        inquiry.setStatusCode(newStatusCode);
        inquiryRepository.save(inquiry);

        InquiryThread log = InquiryThread.builder()
                .inquiryId(id)
                .authorId(ctx.isAuthenticated() ? ctx.getCurrentUserId() : null)
                .typeCode("status_change")
                .content(oldStatus + " → " + newStatusCode)
                .emailSent(false)
                .build();
        threadRepository.save(log);

        return inquiry.toResponseDto();
    }

    /** 우선순위 변경 */
    @Transactional
    public InquiryResponseDto updatePriority(UUID id, String newPriorityCode) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        inquiry.setPriorityCode(newPriorityCode);
        return inquiryRepository.save(inquiry).toResponseDto();
    }

    /** 담당자 지정 */
    @Transactional
    public InquiryResponseDto assign(UUID id, UUID assigneeId) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        inquiry.setAssigneeId(assigneeId);
        return inquiryRepository.save(inquiry).toResponseDto();
    }

    /** 소프트 삭제 */
    @Transactional
    public void delete(UUID id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + id));
        inquiry.setDeletedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);
    }
}
