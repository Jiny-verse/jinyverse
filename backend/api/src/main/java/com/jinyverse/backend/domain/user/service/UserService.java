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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDto create(UserRequestDto requestDto) {
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        User user = User.fromRequestDto(requestDto, encodedPassword);
        User saved = userRepository.save(user);
        return saved.toResponseDto();
    }

    public UserResponseDto getById(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return user.toResponseDto();
    }

    public Page<UserResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return userRepository.findAll(spec(ctx, filter), pageable).map(User::toResponseDto);
    }

    @Transactional
    public UserResponseDto update(UUID id, UserRequestDto requestDto) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
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

    private Specification<User> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"username", "email", "name", "nickname"})
        );
    }
}
