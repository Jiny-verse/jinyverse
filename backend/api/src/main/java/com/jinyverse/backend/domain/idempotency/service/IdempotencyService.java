package com.jinyverse.backend.domain.idempotency.service;

import com.jinyverse.backend.domain.idempotency.entity.IdempotencyRecord;
import com.jinyverse.backend.domain.idempotency.repository.IdempotencyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyRecordRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void insertProcessing(String key, String path, String method, String hash) {
        IdempotencyRecord record = IdempotencyRecord.builder()
                .idempotencyKey(key)
                .requestPath(path)
                .requestMethod(method)
                .requestHash(hash)
                .status(IdempotencyRecord.Status.PROCESSING)
                .build();
        repository.saveAndFlush(record);
    }

    @Transactional(readOnly = true)
    public Optional<IdempotencyRecord> findByKey(String key) {
        return repository.findById(key);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markCompleted(String key, int responseStatus, String responseBody) {
        repository.findById(key).ifPresent(record -> {
            record.setStatus(IdempotencyRecord.Status.COMPLETED);
            record.setResponseStatus(responseStatus);
            record.setResponseBody(responseBody);
            record.setCompletedAt(LocalDateTime.now());
            repository.saveAndFlush(record);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(String key) {
        repository.findById(key).ifPresent(record -> {
            record.setStatus(IdempotencyRecord.Status.FAILED);
            record.setCompletedAt(LocalDateTime.now());
            repository.saveAndFlush(record);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resetToProcessing(String key, String hash) {
        repository.findById(key).ifPresent(record -> {
            record.setStatus(IdempotencyRecord.Status.PROCESSING);
            record.setRequestHash(hash);
            record.setResponseStatus(null);
            record.setResponseBody(null);
            record.setCompletedAt(null);
            repository.saveAndFlush(record);
        });
    }
}
