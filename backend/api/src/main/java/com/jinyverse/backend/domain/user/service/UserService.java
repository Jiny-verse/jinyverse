package com.jinyverse.backend.domain.user.service;

import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.user.dto.UserRequestDto;
import com.jinyverse.backend.domain.user.dto.UserResponseDto;
import com.jinyverse.backend.domain.user.entity.User;
import com.jinyverse.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserResponseDto create(UserRequestDto requestDto) {
        User user = User.fromRequestDto(requestDto);
        User saved = userRepository.save(user);
        return saved.toResponseDto();
    }

    public UserResponseDto getById(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return user.toResponseDto();
    }

    public Page<UserResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return userRepository.findAll(spec(ctx), pageable).map(User::toResponseDto);
    }

    @Transactional
    public UserResponseDto update(UUID id, UserRequestDto requestDto) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.applyUpdate(requestDto);
        User updated = userRepository.save(user);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<User> spec(RequestContext ctx) {
        return CommonSpecifications.notDeleted();
    }
}
