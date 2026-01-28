package com.jinyverse.backend.domain.topic.entity;

import com.jinyverse.backend.domain.common.BaseEntity;
import com.jinyverse.backend.domain.topic.dto.RelTopicTagDto;
import com.jinyverse.backend.domain.tag.entity.Tag;
import com.jinyverse.backend.domain.topic.entity.Topic;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "rel__topic_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelTopicTag extends BaseEntity {

    /** 게시글-태그 연결 ID */
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID", nullable = false)
    private UUID id;

    /** 게시글 ID */
    @Column(name = "topic_id", columnDefinition = "UUID", nullable = false)
    private UUID topicId;

    /** 태그 ID */
    @Column(name = "tag_id", columnDefinition = "UUID", nullable = false)
    private UUID tagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", insertable = false, updatable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", insertable = false, updatable = false)
    private Tag tag;

    public RelTopicTagDto toDto() {
        return RelTopicTagDto.builder()
                .id(this.id)
                .topicId(this.topicId)
                .tagId(this.tagId)
                .createdAt(this.getCreatedAt())
                .build();
    }
}
