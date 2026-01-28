package com.jinyverse.backend.domain.user.entity;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.user.dto.RelUserFileDto;
import com.jinyverse.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rel__user_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class RelUserFile {

    /** 사용자-파일 연결 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 사용자 ID */
    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    private UUID userId;

    /** 파일 ID */
    @Column(name = "file_id", columnDefinition = "UUID", nullable = false)
    private UUID fileId;

    /** 파일 사용 목적 (PROFILE, COVER 등) */
    @Column(name = "usage", length = 40)
    private String usage;

    /** 대표 이미지 여부 */
    @Column(name = "is_main", nullable = false)
    private Boolean isMain;

    /** 생성일시 */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", insertable = false, updatable = false)
    private CommonFile file;

    public RelUserFileDto toDto() {
        return RelUserFileDto.builder()
                .id(this.id)
                .userId(this.userId)
                .fileId(this.fileId)
                .usage(this.usage)
                .isMain(this.isMain)
                .createdAt(this.createdAt)
                .build();
    }
}
