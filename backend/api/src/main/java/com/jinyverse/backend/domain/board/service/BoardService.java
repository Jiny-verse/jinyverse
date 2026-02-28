package com.jinyverse.backend.domain.board.service;

import com.jinyverse.backend.domain.audit.util.AuditLogHelper;
import com.jinyverse.backend.domain.board.dto.BoardRequestDto;
import com.jinyverse.backend.domain.board.dto.BoardResponseDto;
import com.jinyverse.backend.domain.board.entity.Board;
import com.jinyverse.backend.domain.board.repository.BoardRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.RelTopicFileRepository;
import com.jinyverse.backend.domain.topic.repository.RelTopicTagRepository;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import com.jinyverse.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.jinyverse.backend.exception.ForbiddenException;
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
public class BoardService {

    private final BoardRepository boardRepository;
    private final AuditLogHelper auditLogHelper;
    private final TopicRepository topicRepository;
    private final RelTopicFileRepository relTopicFileRepository;
    private final RelTopicTagRepository relTopicTagRepository;

    @Transactional
    public BoardResponseDto create(BoardRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Board create requires ADMIN on INTERNAL channel");
        }
        Board board = Board.fromRequestDto(requestDto);
        Board saved = boardRepository.save(board);
        BoardResponseDto dto = saved.toResponseDto();
        auditLogHelper.log("BOARD", saved.getId(), "CREATE", null, dto);
        return dto;
    }

    public BoardResponseDto getById(UUID id) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));
        return board.toResponseDto();
    }

    public Page<BoardResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return boardRepository.findAll(spec(ctx, filter), pageable).map(Board::toResponseDto);
    }

    public long count() {
        return boardRepository.countByDeletedAtIsNull();
    }

    @Transactional
    public BoardResponseDto update(UUID id, BoardRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Board update requires ADMIN on INTERNAL channel");
        }
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        BoardResponseDto before = board.toResponseDto();
        board.applyUpdate(requestDto);
        Board updated = boardRepository.save(board);
        BoardResponseDto after = updated.toResponseDto();
        auditLogHelper.log("BOARD", id, "UPDATE", before, after);
        return after;
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ForbiddenException("Board delete requires ADMIN on INTERNAL channel");
        }
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        BoardResponseDto before = board.toResponseDto();
        LocalDateTime now = LocalDateTime.now();
        List<Topic> topics = topicRepository.findByBoardIdAndDeletedAtIsNull(id);
        for (Topic topic : topics) {
            relTopicFileRepository.deleteByTopicId(topic.getId());
            relTopicTagRepository.deleteByTopicId(topic.getId());
            topic.setDeletedAt(now);
        }
        topicRepository.saveAll(topics);
        board.setDeletedAt(now);
        boardRepository.save(board);
        auditLogHelper.log("BOARD", id, "DELETE", before, null);
    }

    private Specification<Board> accessControlSpec(RequestContext ctx) {
        Specification<Board> s = CommonSpecifications.notDeleted();
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            if (!ctx.hasRole()) {
                s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent("isPublic", true));
            }
        }
        return s;
    }

    private Specification<Board> spec(RequestContext ctx, Map<String, Object> filter) {
        return CommonSpecifications.and(
                accessControlSpec(ctx),
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"name", "description", "type"})
        );
    }
}
