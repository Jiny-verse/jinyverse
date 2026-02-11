package com.jinyverse.backend.domain.file.storage;

import com.jinyverse.backend.domain.setting.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalFileStorage implements FileStorage {

    private final SystemSettingService systemSettingService;

    @Override
    public void save(String relativePath, InputStream content, long size) throws IOException {
        Path base = resolveBasePath();
        Path target = base.resolve(relativePath).normalize();
        if (!target.startsWith(base)) {
            throw new IllegalArgumentException("Invalid relative path: " + relativePath);
        }
        Files.createDirectories(target.getParent());
        Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public Resource getResource(String relativePath) throws IOException {
        Path base = resolveBasePath();
        Path target = base.resolve(relativePath).normalize();
        if (!target.startsWith(base) || !Files.isRegularFile(target)) {
            return null;
        }
        return new FileSystemResource(target);
    }

    @Override
    public void delete(String relativePath) throws IOException {
        Path base = resolveBasePath();
        Path target = base.resolve(relativePath).normalize();
        if (!target.startsWith(base)) {
            return;
        }
        if (Files.exists(target)) {
            Files.delete(target);
        }
    }

    @Override
    public boolean exists(String relativePath) {
        try {
            Path base = resolveBasePath();
            Path target = base.resolve(relativePath).normalize();
            return target.startsWith(base) && Files.isRegularFile(target);
        } catch (IllegalStateException e) {
            return false;
        }
    }

    private Path resolveBasePath() {
        String basePath = systemSettingService.getFileStorageBasePath();
        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException(
                    "File storage base path is not configured. Set it in admin settings or app.file.storage.base-path.");
        }
        return Path.of(basePath);
    }
}
