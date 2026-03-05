package com.jinyverse.backend.domain.landing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rel__landing_section_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LandingSectionFile {

    @Id
    @UuidGenerator
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    @Column(name = "section_id", columnDefinition = "UUID", nullable = false)
    private UUID sectionId;

    @Column(name = "file_id", columnDefinition = "UUID", nullable = false)
    private UUID fileId;

    @Column(name = "order", nullable = false)
    private Integer order;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", insertable = false, updatable = false)
    private LandingSection section;
}
