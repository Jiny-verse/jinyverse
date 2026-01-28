package com.jinyverse.backend.domain.file.service;

import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.file.dto.CommonFileRequestDto;
import com.jinyverse.backend.domain.file.dto.CommonFileResponseDto;
import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonFileService {

    private final CommonFileRepository commonFileRepository;

    @Transactional
    public CommonFileResponseDto create(CommonFileRequestDto requestDto) {
        CommonFile commonFile = CommonFile.fromRequestDto(requestDto);
        CommonFile saved = commonFileRepository.save(commonFile);
        return saved.toResponseDto();
    }

    public CommonFileResponseDto getById(UUID id) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CommonFile not found with id: " + id));
        return commonFile.toResponseDto();
    }

    public Page<CommonFileResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return commonFileRepository.findAll(spec(ctx), pageable).map(CommonFile::toResponseDto);
    }

    @Transactional
    public CommonFileResponseDto update(UUID id, CommonFileRequestDto requestDto) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CommonFile not found with id: " + id));

        commonFile.applyUpdate(requestDto);
        CommonFile updated = commonFileRepository.save(commonFile);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        CommonFile commonFile = commonFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CommonFile not found with id: " + id));
        commonFileRepository.delete(commonFile);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<CommonFile> spec(RequestContext ctx) {
        return (root, query, cb) -> cb.conjunction();
    }
}
