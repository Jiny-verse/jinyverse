package com.jinyverse.backend.domain.topic.entity;

import com.jinyverse.backend.domain.file.entity.CommonFile;
import com.jinyverse.backend.domain.topic.dto.RelTopicFileDto;
import com.jinyverse.backend.domain.topic.entity.Topic;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rel__topic_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@DynamicInsert
@DynamicUpdate
public class RelTopicFile {

    /** 게시글-파일 연결 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 게시글 ID */
    @Column(name = "topic_id", columnDefinition = "UUID", nullable = false)
    private UUID topicId;

    /** 파일 ID */
    @Column(name = "file_id", columnDefinition = "UUID", nullable = false)
    private UUID fileId;

    /** 게시글 내 파일 정렬 순서 */
    @Column(name = "order", nullable = false)
    private Integer order;

    /** 대표 파일 여부 */
    @Column(name = "is_main", nullable = false)
    private Boolean isMain;

    /** 생성일시 */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", insertable = false, updatable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", insertable = false, updatable = false)
    private CommonFile file;

    public RelTopicFileDto toDto() {
        return RelTopicFileDto.builder()
                .id(this.id)
                .topicId(this.topicId)
                .fileId(this.fileId)
                .order(this.order)
                .isMain(this.isMain)
                .createdAt(this.createdAt)
                .build();
    }
}
