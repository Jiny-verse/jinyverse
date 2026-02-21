package com.jinyverse.backend.domain.topic.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.comment.repository.CommentRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.Role;
import com.jinyverse.backend.domain.topic.dto.TopicRequestDto;
import com.jinyverse.backend.domain.topic.dto.TopicResponseDto;
import com.jinyverse.backend.domain.topic.entity.RelTopicTag;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock private TopicRepository topicRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private RelTopicTagRepository relTopicTagRepository;
    @Mock private AuditLogHelper auditLogHelper;
    @Mock private TopicTagService topicTagService;
    @Mock private TopicFileService topicFileService;

    @InjectMocks
    private TopicService topicService;

    // ===== RequestContext 헬퍼 =====

    private RequestContext adminInternal() {
        return RequestContext.anonymous(Channel.INTERNAL, "127.0.0.1")
                .withAuth(UUID.randomUUID(), "admin", Role.ADMIN);
    }

    private RequestContext userInternal() {
        return RequestContext.anonymous(Channel.INTERNAL, "127.0.0.1")
                .withAuth(UUID.randomUUID(), "user", Role.USER);
    }

    private RequestContext adminExternal() {
        return RequestContext.anonymous(Channel.EXTERNAL, "127.0.0.1")
                .withAuth(UUID.randomUUID(), "admin", Role.ADMIN);
    }

    // ===== create() =====

    @Test
    @DisplayName("create: ADMIN + INTERNAL 채널이면 생성 성공")
    void create_ADMIN_INTERNAL_성공() {
        UUID topicId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID boardId = UUID.randomUUID();

        TopicRequestDto requestDto = TopicRequestDto.builder()
                .authorUserId(authorId)
                .boardId(boardId)
                .title("테스트 제목")
                .content("테스트 내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .build();

        Topic savedTopic = Topic.builder()
                .id(topicId)
                .authorUserId(authorId)
                .boardId(boardId)
                .title("테스트 제목")
                .content("테스트 내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .viewCount(0)
                .hidden(false)
                .build();

        when(topicRepository.save(any(Topic.class))).thenReturn(savedTopic);
        when(topicTagService.fillTagsForSingle(eq(topicId), any())).thenAnswer(inv -> inv.getArgument(1));
        when(topicFileService.getFilesForTopic(topicId)).thenReturn(List.of());

        TopicResponseDto result = topicService.create(requestDto, adminInternal());

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(topicId);
        verify(topicTagService).saveTopicTags(eq(topicId), any());
        verify(topicFileService).saveTopicFiles(eq(topicId), any());
        verify(auditLogHelper).log(eq("TOPIC"), eq(topicId), eq("CREATE"), isNull(), any());
    }

    @Test
    @DisplayName("create: USER 권한이면 FORBIDDEN")
    void create_USER권한_FORBIDDEN() {
        TopicRequestDto requestDto = TopicRequestDto.builder()
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("제목")
                .content("내용")
                .build();

        assertThatThrownBy(() -> topicService.create(requestDto, userInternal()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("create: EXTERNAL 채널이면 FORBIDDEN")
    void create_EXTERNAL채널_FORBIDDEN() {
        TopicRequestDto requestDto = TopicRequestDto.builder()
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("제목")
                .content("내용")
                .build();

        assertThatThrownBy(() -> topicService.create(requestDto, adminExternal()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    // ===== getById() =====

    @Test
    @DisplayName("getById: EXTERNAL 채널에서 조회 시 viewCount 증가")
    void getById_EXTERNAL채널_뷰카운트증가() {
        UUID topicId = UUID.randomUUID();
        Topic topic = Topic.builder()
                .id(topicId)
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("제목")
                .content("내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .viewCount(5)
                .hidden(false)
                .build();

        when(topicRepository.findByIdAndDeletedAtIsNull(topicId)).thenReturn(Optional.of(topic));
        when(topicRepository.save(any(Topic.class))).thenReturn(topic);
        when(topicTagService.fillTagsForSingle(eq(topicId), any())).thenAnswer(inv -> inv.getArgument(1));
        when(topicFileService.getFilesForTopic(topicId)).thenReturn(List.of());

        RequestContext externalCtx = RequestContext.anonymous(Channel.EXTERNAL, "1.2.3.4");
        topicService.getById(topicId, externalCtx);

        assertThat(topic.getViewCount()).isEqualTo(6);
        verify(topicRepository).save(topic);
    }

    @Test
    @DisplayName("getById: INTERNAL 채널에서 조회 시 viewCount 불변")
    void getById_INTERNAL채널_뷰카운트불변() {
        UUID topicId = UUID.randomUUID();
        Topic topic = Topic.builder()
                .id(topicId)
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("제목")
                .content("내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .viewCount(5)
                .hidden(false)
                .build();

        when(topicRepository.findByIdAndDeletedAtIsNull(topicId)).thenReturn(Optional.of(topic));
        when(topicTagService.fillTagsForSingle(eq(topicId), any())).thenAnswer(inv -> inv.getArgument(1));
        when(topicFileService.getFilesForTopic(topicId)).thenReturn(List.of());

        topicService.getById(topicId, adminInternal());

        assertThat(topic.getViewCount()).isEqualTo(5);
        verify(topicRepository, never()).save(any());
    }

    // ===== promoteDraft() — update() 를 통해 간접 테스트 =====

    @Test
    @DisplayName("promoteDraft: 정상 흐름 — draft → created, 원본 소프트 삭제")
    void promoteDraft_정상흐름() {
        UUID originalId = UUID.randomUUID();
        UUID draftId = UUID.randomUUID();

        Topic draft = Topic.builder()
                .id(draftId)
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("초안 제목")
                .content("초안 내용")
                .statusCategoryCode("topic_status")
                .status("temporary")
                .isNotice(false)
                .isPinned(false)
                .isPublic(false)
                .viewCount(0)
                .hidden(false)
                .sourceTopicId(originalId)
                .build();

        Topic original = Topic.builder()
                .id(originalId)
                .authorUserId(draft.getAuthorUserId())
                .boardId(draft.getBoardId())
                .title("원본 제목")
                .content("원본 내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .viewCount(10)
                .hidden(true)
                .build();

        TopicRequestDto requestDto = TopicRequestDto.builder()
                .title("초안 제목")
                .content("초안 내용")
                .status("created")
                .build();

        // update() 첫 findByIdAndDeletedAtIsNull → draft 반환
        // promoteDraft() 내부 findByIdAndDeletedAtIsNull → original 반환
        when(topicRepository.findByIdAndDeletedAtIsNull(draftId)).thenReturn(Optional.of(draft));
        when(topicRepository.findByIdAndDeletedAtIsNull(originalId)).thenReturn(Optional.of(original));
        when(topicRepository.save(any(Topic.class))).thenAnswer(inv -> inv.getArgument(0));
        when(commentRepository.findByTopicId(originalId)).thenReturn(List.of());
        when(relTopicTagRepository.findByTopicId(originalId)).thenReturn(List.of());
        when(topicTagService.fillTagsForSingle(eq(draftId), any())).thenAnswer(inv -> inv.getArgument(1));
        when(topicFileService.getFilesForTopic(draftId)).thenReturn(List.of());

        TopicResponseDto result = topicService.update(draftId, requestDto, adminInternal());

        assertThat(result).isNotNull();
        assertThat(draft.getSourceTopicId()).isNull();
        assertThat(draft.getStatus()).isEqualTo("created");
        assertThat(original.getDeletedAt()).isNotNull();
        verify(topicFileService).moveFilesToTopic(originalId, draftId);
    }

    @Test
    @DisplayName("promoteDraft: 원본 토픽이 없으면 RuntimeException")
    void promoteDraft_드래프트없음_예외() {
        UUID originalId = UUID.randomUUID();
        UUID draftId = UUID.randomUUID();

        Topic draft = Topic.builder()
                .id(draftId)
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("초안")
                .content("내용")
                .statusCategoryCode("topic_status")
                .status("temporary")
                .isNotice(false)
                .isPinned(false)
                .isPublic(false)
                .viewCount(0)
                .hidden(false)
                .sourceTopicId(originalId)
                .build();

        TopicRequestDto requestDto = TopicRequestDto.builder()
                .status("created")
                .title("초안")
                .content("내용")
                .build();

        when(topicRepository.findByIdAndDeletedAtIsNull(draftId)).thenReturn(Optional.of(draft));
        when(commentRepository.findByTopicId(originalId)).thenReturn(List.of());
        when(relTopicTagRepository.findByTopicId(originalId)).thenReturn(List.of());
        // 원본이 존재하지 않음
        when(topicRepository.findByIdAndDeletedAtIsNull(originalId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> topicService.update(draftId, requestDto, adminInternal()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Original topic not found");
    }

    @Test
    @DisplayName("promoteDraft: sourceTopicId가 없는 일반 게시글에 status=created 업데이트 → 일반 업데이트 수행")
    void promoteDraft_이미Published_일반업데이트() {
        UUID topicId = UUID.randomUUID();

        Topic topic = Topic.builder()
                .id(topicId)
                .authorUserId(UUID.randomUUID())
                .boardId(UUID.randomUUID())
                .title("원본 제목")
                .content("원본 내용")
                .statusCategoryCode("topic_status")
                .status("created")
                .isNotice(false)
                .isPinned(false)
                .isPublic(true)
                .viewCount(0)
                .hidden(false)
                .sourceTopicId(null) // 드래프트 아님
                .build();

        TopicRequestDto requestDto = TopicRequestDto.builder()
                .title("수정된 제목")
                .status("created")
                .build();

        when(topicRepository.findByIdAndDeletedAtIsNull(topicId)).thenReturn(Optional.of(topic));
        when(topicRepository.save(any(Topic.class))).thenAnswer(inv -> inv.getArgument(0));
        when(topicTagService.fillTagsForSingle(eq(topicId), any())).thenAnswer(inv -> inv.getArgument(1));
        when(topicFileService.getFilesForTopic(topicId)).thenReturn(List.of());

        TopicResponseDto result = topicService.update(topicId, requestDto, adminInternal());

        // 일반 업데이트 수행 — promoteDraft 아님
        assertThat(result).isNotNull();
        assertThat(topic.getTitle()).isEqualTo("수정된 제목");
        verify(topicTagService).saveTopicTags(eq(topicId), any());
        verify(topicFileService).saveTopicFiles(eq(topicId), any());
    }
}
