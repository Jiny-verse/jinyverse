package com.jinyverse.backend.domain.board.service;

import com.jinyverse.backend.domain.board.dto.BoardRequestDto;
import com.jinyverse.backend.domain.board.dto.BoardResponseDto;
import com.jinyverse.backend.domain.board.entity.Board;
import com.jinyverse.backend.domain.board.repository.BoardRepository;
import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    @Transactional
    public BoardResponseDto create(BoardRequestDto requestDto, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Board create requires ADMIN on INTERNAL channel");
        }
        Board board = Board.fromRequestDto(requestDto);
        Board saved = boardRepository.save(board);
        return saved.toResponseDto();
    }

    public BoardResponseDto getById(UUID id) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));
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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Board update requires ADMIN on INTERNAL channel");
        }
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));

        board.applyUpdate(requestDto);
        Board updated = boardRepository.save(board);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id, RequestContext ctx) {
        if (ctx == null || !ctx.isAdmin() || ctx.getChannel() != Channel.INTERNAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Board delete requires ADMIN on INTERNAL channel");
        }
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));

        board.setDeletedAt(LocalDateTime.now());
        boardRepository.save(board);
    }

    /** 접근 제어 전용: 삭제 여부, 채널별 노출 */
    private Specification<Board> accessControlSpec(RequestContext ctx) {
        Specification<Board> s = CommonSpecifications.notDeleted();
        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            s = CommonSpecifications.and(s, CommonSpecifications.eqIfPresent("isPublic", true));
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
