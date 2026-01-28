package com.jinyverse.backend.domain.board.repository;

import com.jinyverse.backend.domain.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardRepository extends JpaRepository<Board, UUID>, JpaSpecificationExecutor<Board> {
    Optional<Board> findByIdAndDeletedAtIsNull(UUID id);
}
