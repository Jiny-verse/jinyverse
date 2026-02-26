package com.jinyverse.backend.domain.notification.service;

import com.jinyverse.backend.domain.notification.dto.NotificationSettingRequestDto;
import com.jinyverse.backend.domain.notification.dto.NotificationSettingResponseDto;
import com.jinyverse.backend.domain.notification.entity.NotificationSetting;
import com.jinyverse.backend.domain.notification.repository.NotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationSettingService {

    private final NotificationSettingRepository settingRepository;

    public NotificationSettingResponseDto getOrCreate(UUID userId) {
        NotificationSetting setting = settingRepository.findByUserId(userId)
                .orElseGet(() -> createDefault(userId));
        return toResponseDto(setting);
    }

    @Transactional
    public NotificationSettingResponseDto update(UUID userId, NotificationSettingRequestDto dto) {
        NotificationSetting setting = settingRepository.findByUserId(userId)
                .orElseGet(() -> createDefault(userId));

        if (dto.getSystemEnabled() != null) setting.setSystemEnabled(dto.getSystemEnabled());
        if (dto.getEmailEnabled() != null) setting.setEmailEnabled(dto.getEmailEnabled());
        if (dto.getEmailOverride() != null) setting.setEmailOverride(dto.getEmailOverride());
        if (dto.getTypeSettings() != null) setting.setTypeSettings(dto.getTypeSettings());

        return toResponseDto(settingRepository.save(setting));
    }

    private NotificationSetting createDefault(UUID userId) {
        NotificationSetting setting = NotificationSetting.builder()
                .userId(userId)
                .systemEnabled(true)
                .emailEnabled(false)
                .build();
        return settingRepository.save(setting);
    }

    private NotificationSettingResponseDto toResponseDto(NotificationSetting s) {
        return NotificationSettingResponseDto.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .systemEnabled(s.getSystemEnabled())
                .emailEnabled(s.getEmailEnabled())
                .emailOverride(s.getEmailOverride())
                .typeSettings(s.getTypeSettings())
                .build();
    }
}
