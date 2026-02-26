package com.jinyverse.backend.domain.notification.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.notification.dto.NotificationTemplateRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationTemplateResponseDto;
import com.jinyverse.backend.domain.notification.entity.NotificationTemplate;
import com.jinyverse.backend.domain.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;

    @Transactional
    public NotificationTemplateResponseDto create(NotificationTemplateRequestDto dto) {
        NotificationTemplate template = NotificationTemplate.fromRequestDto(dto);
        return templateRepository.save(template).toResponseDto();
    }

    public NotificationTemplateResponseDto getById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NotificationTemplate not found with id: " + id))
                .toResponseDto();
    }

    public Page<NotificationTemplateResponseDto> getAll(Map<String, Object> filter, Pageable pageable) {
        return templateRepository.findAll(spec(filter), pageable).map(NotificationTemplate::toResponseDto);
    }

    @Transactional
    public NotificationTemplateResponseDto update(UUID id, NotificationTemplateRequestDto dto) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NotificationTemplate not found with id: " + id));
        template.applyUpdate(dto);
        return templateRepository.save(template).toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NotificationTemplate not found with id: " + id));
        template.setDeletedAt(LocalDateTime.now());
        templateRepository.save(template);
    }

    private Specification<NotificationTemplate> spec(Map<String, Object> filter) {
        return CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"name"})
        );
    }
}
