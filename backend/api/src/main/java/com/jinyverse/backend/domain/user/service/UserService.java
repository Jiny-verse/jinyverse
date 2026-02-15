package com.jinyverse.backend.domain.user.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.file.repository.CommonFileRepository;
import com.jinyverse.backend.domain.user.dto.UserRequestDto;
import com.jinyverse.backend.exception.BadRequestException;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import com.jinyverse.backend.domain.user.dto.UserResponseDto;
import com.jinyverse.backend.domain.user.entity.RelUserFile;
import com.jinyverse.backend.domain.user.entity.User;
import com.jinyverse.backend.domain.user.repository.RelUserFileRepository;
import com.jinyverse.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private static final String USAGE_PROFILE = "PROFILE";

    private final UserRepository userRepository;
    private final RelUserFileRepository relUserFileRepository;
    private final CommonFileRepository commonFileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogHelper auditLogHelper;

    @Transactional
    public UserResponseDto create(UserRequestDto requestDto) {
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        User user = User.fromRequestDto(requestDto, encodedPassword);
        User saved = userRepository.save(user);
        UserResponseDto dto = saved.toResponseDto();
        auditLogHelper.log("USER", saved.getId(), "CREATE", null, dto);
        return dto;
    }

    public UserResponseDto getById(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        UserResponseDto dto = user.toResponseDto();
        fillProfileCoverFileIds(dto, id);
        return dto;
    }

    public UserResponseDto getMe(UUID userId) {
        return getById(userId);
    }

    @Transactional
    public void setProfileImage(UUID userId, UUID fileId) {
        ensureUserExists(userId);
        CommonFile file = commonFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", fileId));
        if (file.getMimeType() == null || !file.getMimeType().startsWith("image/")) {
            throw new BadRequestException("PROFILE_IMAGE_NOT_IMAGE", "프로필 이미지는 이미지 파일이어야 합니다.");
        }
        relUserFileRepository.deleteByUserIdAndUsage(userId, USAGE_PROFILE);
        relUserFileRepository.save(RelUserFile.builder()
                .userId(userId)
                .fileId(fileId)
                .usage(USAGE_PROFILE)
                .isMain(true)
                .build());

        if (file.getSessionId() != null) {
            file.setSessionId(null);
            commonFileRepository.save(file);
        }
    }

    @Transactional
    public void clearProfileImage(UUID userId) {
        ensureUserExists(userId);
        relUserFileRepository.deleteByUserIdAndUsage(userId, USAGE_PROFILE);
    }

    private void fillProfileCoverFileIds(UserResponseDto dto, UUID userId) {
        List<RelUserFile> list = relUserFileRepository.findByUserId(userId);
        for (RelUserFile r : list) {
            if (USAGE_PROFILE.equals(r.getUsage()))
                dto.setProfileImageFileId(r.getFileId());
        }
    }

    private void ensureUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
    }

    public Page<UserResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return userRepository.findAll(spec(ctx, filter), pageable).map(User::toResponseDto);
    }

    @Transactional
    public UserResponseDto update(UUID id, UserRequestDto requestDto) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        UserResponseDto before = user.toResponseDto();
        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
        user.applyUpdate(requestDto);
        UserResponseDto after = user.toResponseDto();
        auditLogHelper.log("USER", id, "UPDATE", before, after);
        return after;
    }

    @Transactional
    public UserResponseDto update(UUID id, com.jinyverse.backend.domain.user.dto.UserUpdateDto updateDto) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        UserResponseDto before = user.toResponseDto();

        if (updateDto.getPassword() != null && !updateDto.getPassword().isBlank()) {
            if (updateDto.getCurrentPassword() == null
                    || !passwordEncoder.matches(updateDto.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("INVALID_PASSWORD", "현재 비밀번호가 일치하지 않습니다.");
            }
            user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }

        if (updateDto.getName() != null)
            user.setName(updateDto.getName());
        if (updateDto.getNickname() != null)
            user.setNickname(updateDto.getNickname());
        if (updateDto.getEmail() != null)
            user.setEmail(updateDto.getEmail());
        if (updateDto.getIsActive() != null)
            user.setIsActive(updateDto.getIsActive());
        if (updateDto.getIsLocked() != null)
            user.setIsLocked(updateDto.getIsLocked());
        if (updateDto.getRole() != null)
            user.setRole(updateDto.getRole());

        UserResponseDto after = user.toResponseDto();
        auditLogHelper.log("USER", id, "UPDATE", before, after);
        return after;
    }

    @Transactional
    public void delete(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        UserResponseDto before = user.toResponseDto();
        relUserFileRepository.deleteByUserId(id);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        auditLogHelper.log("USER", id, "DELETE", before, null);
    }

    private Specification<User> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q",
                        new String[] { "username", "email", "name", "nickname" }));
    }
}
