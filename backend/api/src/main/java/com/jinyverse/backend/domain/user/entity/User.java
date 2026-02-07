package com.jinyverse.backend.domain.user.entity;

import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeCategory;
import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.user.dto.UserRequestDto;
import com.jinyverse.backend.domain.user.dto.UserResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /** 사용자 고유 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 권한 분류 코드
     * 값: role */
    @Column(name = "role_category_code", length = 40, nullable = false)
    private String roleCategoryCode;

    /** 권한 코드 값
     * 값: user, admin */
    @Column(name = "role", length = 40, nullable = false)
    private String role;

    /** 로그인 아이디 */
    @Column(name = "username", length = 50, nullable = false)
    private String username;

    /** 비밀번호 해시 */
    @Column(name = "password", length = 256, nullable = false)
    private String password;

    /** 비밀번호 해시 솔트 */
    @Column(name = "salt", length = 16, nullable = false)
    private String salt;

    /** 이메일 */
    @Column(name = "email", length = 256, nullable = false, unique = true)
    private String email;

    /** 사용자 실명 */
    @Column(name = "name", length = 20, nullable = false)
    private String name;

    /** 닉네임 */
    @Column(name = "nickname", length = 20, nullable = false)
    private String nickname;

    /** 계정 활성 여부 */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    /** 계정 잠금 여부 */
    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_category_code", insertable = false, updatable = false)
    private CodeCategory roleCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "role_category_code", referencedColumnName = "category_code", insertable = false, updatable = false),
            @JoinColumn(name = "role", referencedColumnName = "code", insertable = false, updatable = false)
    })
    private Code roleCode;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserAuthCount> authCounts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Verification> verifications = new ArrayList<>();

    public static User fromRequestDto(UserRequestDto dto) {
        if (dto == null) throw new IllegalArgumentException("UserRequestDto is null");
        return User.builder()
                .roleCategoryCode(dto.getRoleCategoryCode() != null ? dto.getRoleCategoryCode() : "role")
                .role(dto.getRole() != null ? dto.getRole() : "user")
                .username(dto.getUsername())
                .password(dto.getPassword())
                .salt("") // TODO: salt 생성 로직 필요
                .email(dto.getEmail())
                .name(dto.getName())
                .nickname(dto.getNickname())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .isLocked(dto.getIsLocked() != null ? dto.getIsLocked() : false)
                .build();
    }

    public void applyUpdate(UserRequestDto dto) {
        if (dto == null) return;
        if (dto.getRoleCategoryCode() != null) this.roleCategoryCode = dto.getRoleCategoryCode();
        if (dto.getRole() != null) this.role = dto.getRole();
        if (dto.getUsername() != null) this.username = dto.getUsername();
        if (dto.getPassword() != null) this.password = dto.getPassword();
        if (dto.getEmail() != null) this.email = dto.getEmail();
        if (dto.getName() != null) this.name = dto.getName();
        if (dto.getNickname() != null) this.nickname = dto.getNickname();
        if (dto.getIsActive() != null) this.isActive = dto.getIsActive();
        if (dto.getIsLocked() != null) this.isLocked = dto.getIsLocked();
    }

    public UserRequestDto toDto() {
        return UserRequestDto.builder()
                .roleCategoryCode(this.roleCategoryCode)
                .role(this.role)
                .username(this.username)
                .password(this.password)
                .email(this.email)
                .name(this.name)
                .nickname(this.nickname)
                .isActive(this.isActive)
                .isLocked(this.isLocked)
                .build();
    }

    public UserResponseDto toResponseDto() {
        return UserResponseDto.builder()
                .id(this.id)
                .roleCategoryCode(this.roleCategoryCode)
                .role(this.role)
                .username(this.username)
                .email(this.email)
                .name(this.name)
                .nickname(this.nickname)
                .isActive(this.isActive)
                .isLocked(this.isLocked)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .deletedAt(this.getDeletedAt())
                .build();
    }
}
