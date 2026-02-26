package com.jinyverse.backend.domain.inquiry.controller;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.inquiry.dto.InquiryRequestDto;
import com.jinyverse.backend.domain.inquiry.dto.InquiryResponseDto;
import com.jinyverse.backend.domain.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /** [Public] 티켓 생성 */
    @PostMapping
    public ResponseEntity<InquiryResponseDto> create(
            @Valid @RequestBody InquiryRequestDto dto,
            RequestContext ctx) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inquiryService.create(dto, ctx));
    }

    /** [Admin] 전체 목록 */
    @GetMapping
    public ResponseEntity<Page<InquiryResponseDto>> getAll(
            @RequestParam Map<String, Object> filter,
            Pageable pageable) {
        return ResponseEntity.ok(inquiryService.getAll(filter, pageable));
    }

    /** [Admin] 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<InquiryResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(inquiryService.getById(id));
    }

    /** [Admin] 상태 변경 */
    @PostMapping("/{id}/update-status")
    public ResponseEntity<InquiryResponseDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            RequestContext ctx) {
        return ResponseEntity.ok(inquiryService.updateStatus(id, body.get("statusCode"), ctx));
    }

    /** [Admin] 우선순위 변경 */
    @PostMapping("/{id}/update-priority")
    public ResponseEntity<InquiryResponseDto> updatePriority(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(inquiryService.updatePriority(id, body.get("priorityCode")));
    }

    /** [Admin] 담당자 지정 */
    @PostMapping("/{id}/assign")
    public ResponseEntity<InquiryResponseDto> assign(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID assigneeId = body.get("assigneeId") != null ? UUID.fromString(body.get("assigneeId")) : null;
        return ResponseEntity.ok(inquiryService.assign(id, assigneeId));
    }

    /** [Member] 내 티켓 목록 */
    @GetMapping("/me")
    public ResponseEntity<Page<InquiryResponseDto>> getMyInquiries(
            @RequestParam Map<String, Object> filter,
            Pageable pageable,
            RequestContext ctx) {
        return ResponseEntity.ok(inquiryService.getMyInquiries(filter, pageable, ctx));
    }

    /** [Member] 내 티켓 상세 */
    @GetMapping("/me/{id}")
    public ResponseEntity<InquiryResponseDto> getMyInquiryById(
            @PathVariable UUID id,
            RequestContext ctx) {
        return ResponseEntity.ok(inquiryService.getMyInquiryById(id, ctx));
    }

    /** [Admin] 소프트 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        inquiryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
