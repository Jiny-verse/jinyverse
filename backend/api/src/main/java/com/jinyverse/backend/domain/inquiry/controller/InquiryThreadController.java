package com.jinyverse.backend.domain.inquiry.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadRequestDto;
import com.jinyverse.backend.domain.inquiry.dto.InquiryThreadResponseDto;
import com.jinyverse.backend.domain.inquiry.service.InquiryThreadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inquiries/{inquiryId}/threads")
@RequiredArgsConstructor
public class InquiryThreadController {

    private final InquiryThreadService threadService;

    /** 스레드 추가 */
    @PostMapping
    public ResponseEntity<InquiryThreadResponseDto> addThread(
            @PathVariable UUID inquiryId,
            @Valid @RequestBody InquiryThreadRequestDto dto,
            RequestContext ctx) {
        return ResponseEntity.status(HttpStatus.CREATED).body(threadService.addThread(inquiryId, dto, ctx));
    }

    /** 스레드 목록 조회 */
    @GetMapping
    public ResponseEntity<List<InquiryThreadResponseDto>> getThreads(@PathVariable UUID inquiryId) {
        return ResponseEntity.ok(threadService.getThreads(inquiryId));
    }

    /** 스레드 소프트 삭제 */
    @DeleteMapping("/{threadId}")
    public ResponseEntity<Void> deleteThread(
            @PathVariable UUID inquiryId,
            @PathVariable UUID threadId) {
        threadService.deleteThread(threadId);
        return ResponseEntity.noContent().build();
    }
}
