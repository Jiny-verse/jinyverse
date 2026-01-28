package com.jinyverse.backend.domain.board.service;

import com.jinyverse.backend.domain.board.dto.BoardRequestDto;
import com.jinyverse.backend.domain.board.dto.BoardResponseDto;
import com.jinyverse.backend.domain.board.entity.Board;
import com.jinyverse.backend.domain.board.repository.BoardRepository;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
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
public class BoardService {

    private final BoardRepository boardRepository;

    @Transactional
    public BoardResponseDto create(BoardRequestDto requestDto) {
        Board board = Board.fromRequestDto(requestDto);
        Board saved = boardRepository.save(board);
        return saved.toResponseDto();
    }

    public BoardResponseDto getById(UUID id) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));
        return board.toResponseDto();
    }

    public Page<BoardResponseDto> getAll(Pageable pageable, RequestContext ctx) {
        return boardRepository.findAll(spec(ctx), pageable).map(Board::toResponseDto);
    }

    @Transactional
    public BoardResponseDto update(UUID id, BoardRequestDto requestDto) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));

        board.applyUpdate(requestDto);
        Board updated = boardRepository.save(board);
        return updated.toResponseDto();
    }

    @Transactional
    public void delete(UUID id) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));

        board.setDeletedAt(LocalDateTime.now());
        boardRepository.save(board);
    }

    /**
     * 권한 및 채널에 따른 강제 조건
     */
    private Specification<Board> spec(RequestContext ctx) {
        Specification<Board> result = CommonSpecifications.notDeleted();

        if (ctx != null && ctx.getChannel() != null && "EXTERNAL".equals(ctx.getChannel().name())) {
            result = result.and(CommonSpecifications.eqIfPresent("isPublic", true));
        }

        return result;
    }
}
