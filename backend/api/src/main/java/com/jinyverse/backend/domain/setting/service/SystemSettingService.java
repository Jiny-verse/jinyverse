package com.jinyverse.backend.domain.setting.service;

import com.jinyverse.backend.domain.setting.dto.FileStorageSettingDto;
import com.jinyverse.backend.domain.setting.entity.SystemSetting;
import com.jinyverse.backend.domain.setting.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    public static final String KEY_FILE_STORAGE_BASE_PATH = "file.storage.basePath";

    private final SystemSettingRepository systemSettingRepository;

    @Value("${app.file.storage.base-path:}")
    private String defaultBasePath;

    @Transactional(readOnly = true)
    public Optional<String> getValue(String key) {
        return systemSettingRepository.findById(key)
                .map(SystemSetting::getValue);
    }

    @Transactional
    public void setValue(String key, String value) {
        SystemSetting setting = systemSettingRepository.findById(key).orElse(new SystemSetting());
        setting.setKey(key);
        setting.setValue(value);
        setting.setUpdatedAt(LocalDateTime.now());
        systemSettingRepository.save(setting);
    }

    /** 파일 저장 경로: DB에 있으면 그 값, 없으면 application.yml 기본값. */
    @Transactional(readOnly = true)
    public String getFileStorageBasePath() {
        return getValue(KEY_FILE_STORAGE_BASE_PATH)
                .filter(s -> s != null && !s.isBlank())
                .orElse(defaultBasePath != null && !defaultBasePath.isBlank() ? defaultBasePath : null);
    }

    @Transactional(readOnly = true)
    public FileStorageSettingDto getFileStorageSetting() {
        String basePath = getFileStorageBasePath();
        return FileStorageSettingDto.builder()
                .basePath(basePath)
                .build();
    }

    @Transactional
    public FileStorageSettingDto updateFileStorageSetting(FileStorageSettingDto dto) {
        if (dto != null && dto.getBasePath() != null) {
            setValue(KEY_FILE_STORAGE_BASE_PATH, dto.getBasePath().trim());
        } else {
            setValue(KEY_FILE_STORAGE_BASE_PATH, "");
        }
        return getFileStorageSetting();
    }
}
