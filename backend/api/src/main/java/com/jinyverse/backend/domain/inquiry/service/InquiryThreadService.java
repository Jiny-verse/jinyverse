package com.jinyverse.backend.domain.inquiry.service;

import com.jinyverse.backend.config.EmailSender;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadRequestDto;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadResponseDto;
import com.jinyverse.backend.domain.inquiry.entity.Inquiry;
import com.jinyverse.backend.domain.inquiry.entity.InquiryThread;
import com.jinyverse.backend.domain.inquiry.repository.InquiryRepository;
import com.jinyverse.backend.domain.inquiry.repository.InquiryThreadRepository;
import com.jinyverse.backend.domain.notification.service.NotificationService;
import com.jinyverse.backend.domain.user.entity.User;
import com.jinyverse.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryThreadService {

    private final InquiryRepository inquiryRepository;
    private final InquiryThreadRepository threadRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailSender emailSender;

    /** 스레드 추가 */
    @Transactional
    public InquiryThreadResponseDto addThread(UUID inquiryId, InquiryThreadRequestDto dto, RequestContext ctx) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + inquiryId));

        InquiryThread thread = InquiryThread.builder()
                .inquiryId(inquiryId)
                .authorId(ctx.isAuthenticated() ? ctx.getCurrentUserId() : null)
                .typeCode(dto.getTypeCode())
                .content(dto.getContent())
                .emailSent(false)
                .build();
        InquiryThread saved = threadRepository.save(thread);

        // staff_reply + sendEmail 처리
        if ("staff_reply".equals(dto.getTypeCode()) && dto.isSendEmail()) {
            String toEmail = inquiry.getUserId() != null
                    ? userRepository.findById(inquiry.getUserId()).map(User::getEmail).orElse(null)
                    : inquiry.getGuestEmail();

            if (toEmail != null && ctx.isAuthenticated()) {
                User replier = userRepository.findById(ctx.getCurrentUserId()).orElseThrow();
                emailSender.sendInquiryReplyEmail(toEmail, inquiry.getTicketNo(), dto.getContent(), replier.getName());
                saved.setSentFromEmail(replier.getEmail());
                saved.setSentToEmail(toEmail);
                saved.setEmailSent(true);
                saved.setEmailSentAt(LocalDateTime.now());
                threadRepository.save(saved);
            }
        }

        // staff_reply 시 회원 알림 발송
        if ("staff_reply".equals(dto.getTypeCode()) && inquiry.getUserId() != null) {
            notificationService.sendToUser(
                    inquiry.getUserId(),
                    "inquiry_replied",
                    "티켓 [" + inquiry.getTicketNo() + "]에 답변이 등록되었습니다.",
                    "/inquiries/" + inquiryId,
                    null
            );
        }

        // staff_reply 시 상태 자동 변경
        if ("staff_reply".equals(dto.getTypeCode())) {
            inquiry.setStatusCode("answered");
            inquiryRepository.save(inquiry);
        }

        return saved.toResponseDto();
    }

    /** 스레드 목록 조회 */
    public List<InquiryThreadResponseDto> getThreads(UUID inquiryId) {
        return threadRepository.findByInquiryIdAndDeletedAtIsNull(inquiryId)
                .stream()
                .map(InquiryThread::toResponseDto)
                .toList();
    }

    /** 스레드 소프트 삭제 */
    @Transactional
    public void deleteThread(UUID threadId) {
        InquiryThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("InquiryThread not found: " + threadId));
        thread.setDeletedAt(LocalDateTime.now());
        threadRepository.save(thread);
    }
}
