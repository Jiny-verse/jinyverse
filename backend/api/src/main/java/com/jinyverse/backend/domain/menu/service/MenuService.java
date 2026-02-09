package com.jinyverse.backend.domain.menu.service;

import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.CommonSpecifications;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.board.entity.Board;
import com.jinyverse.backend.domain.board.repository.BoardRepository;
import com.jinyverse.backend.domain.menu.dto.MenuRequestDto;
import com.jinyverse.backend.domain.menu.dto.MenuResolveResponseDto;
import com.jinyverse.backend.domain.menu.dto.MenuResponseDto;
import com.jinyverse.backend.domain.menu.entity.Menu;
import com.jinyverse.backend.domain.menu.repository.MenuRepository;
import com.jinyverse.backend.domain.topic.entity.Topic;
import com.jinyverse.backend.domain.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static com.jinyverse.backend.domain.common.util.CommonSpecifications.PAGINATION_KEYS;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;
    private final BoardRepository boardRepository;
    private final TopicRepository topicRepository;

    @Transactional
    public MenuResponseDto create(MenuRequestDto requestDto) {
        if (requestDto.getUpperId() != null && menuRepository.findById(requestDto.getUpperId()).isEmpty()) {
            throw new IllegalArgumentException("상위 메뉴를 찾을 수 없습니다.");
        }
        Menu menu = Menu.fromRequestDto(requestDto);
        return menuRepository.save(menu).toResponseDto();
    }

    public MenuResponseDto getByCode(String code) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));
        return menu.toResponseDto();
    }

    /**
     * 메뉴 클릭 시 이동 대상: ① 게시판 연결 → 리스트, ② 게시글 연결 → 상세, ③ 메뉴 기본 링크(path)
     */
    public Optional<MenuResolveResponseDto> resolve(String code) {
        // ① 게시판에 이 메뉴 코드가 연결된 경우 → 게시판 리스트(문의사항 등)
        Specification<Board> boardSpec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.eqIfPresent("menuCode", code));
        List<Board> boards = boardRepository.findAll(boardSpec, PageRequest.of(0, 1)).getContent();
        if (!boards.isEmpty()) {
            return Optional.of(MenuResolveResponseDto.builder()
                    .type("board")
                    .boardId(boards.get(0).getId())
                    .build());
        }
        // ② 게시글에 이 메뉴 코드가 연결된 경우 → 게시글 상세(소개페이지 등)
        Specification<Topic> topicSpec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.eqIfPresent("menuCode", code));
        List<Topic> topics = topicRepository.findAll(topicSpec, PageRequest.of(0, 1)).getContent();
        if (!topics.isEmpty()) {
            Topic t = topics.get(0);
            return Optional.of(MenuResolveResponseDto.builder()
                    .type("topic")
                    .boardId(t.getBoardId())
                    .topicId(t.getId())
                    .build());
        }
        // ③ 메뉴 베이스 링크(path)가 있으면 그대로 사용
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code).orElse(null);
        if (menu != null && menu.getPath() != null && !menu.getPath().isBlank()) {
            return Optional.of(MenuResolveResponseDto.builder()
                    .type("link")
                    .path(menu.getPath())
                    .build());
        }
        return Optional.empty();
    }

    public Page<MenuResponseDto> getAll(Map<String, Object> filter, Pageable pageable, RequestContext ctx) {
        return menuRepository.findAll(spec(ctx, filter), pageable).map(Menu::toResponseDto);
    }

    /** 관리용: 채널 필터 없이 전체 조회. INTERNAL + ADMIN에서만 호출할 것. */
    public Page<MenuResponseDto> getAllForManagement(Map<String, Object> filter, Pageable pageable) {
        return menuRepository.findAll(specForManagement(filter), pageable).map(Menu::toResponseDto);
    }

    @Transactional
    public MenuResponseDto update(String code, MenuRequestDto requestDto) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));

        String newCode = requestDto.getCode() != null && !requestDto.getCode().isBlank()
                ? requestDto.getCode().trim()
                : code;

        if (!newCode.equals(code)) {
            if (menuRepository.findByCodeAndDeletedAtIsNull(newCode).isPresent()) {
                throw new IllegalArgumentException("이미 사용 중인 메뉴 코드입니다: " + newCode);
            }
            updateBoardMenuCode(code, newCode);
            updateTopicMenuCode(code, newCode);
        }

        validateUpperIdNotCircular(menu.getId(), requestDto.getUpperId());
        menu.applyUpdate(requestDto);
        return menuRepository.save(menu).toResponseDto();
    }

    private void updateBoardMenuCode(String oldCode, String newCode) {
        Specification<Board> spec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.eqIfPresent("menuCode", oldCode));
        List<Board> boards = boardRepository.findAll(spec);
        boards.forEach(b -> b.setMenuCode(newCode));
        if (!boards.isEmpty()) boardRepository.saveAll(boards);
    }

    private void updateTopicMenuCode(String oldCode, String newCode) {
        Specification<Topic> spec = CommonSpecifications.and(
                CommonSpecifications.notDeleted(),
                CommonSpecifications.eqIfPresent("menuCode", oldCode));
        List<Topic> topics = topicRepository.findAll(spec);
        topics.forEach(t -> t.setMenuCode(newCode));
        if (!topics.isEmpty()) topicRepository.saveAll(topics);
    }

    @Transactional
    public void delete(String code) {
        Menu menu = menuRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new RuntimeException("Menu not found with code: " + code));

        menu.setDeletedAt(LocalDateTime.now());
        menuRepository.save(menu);
    }

    /**
     * 상위 메뉴 설정 시 순환 참조 방지: upperId로 타고 올라갔을 때 selfId가 나오면 안 됨.
     */
    private void validateUpperIdNotCircular(UUID selfId, UUID upperId) {
        if (upperId == null) return;
        if (upperId.equals(selfId)) {
            throw new IllegalArgumentException("상위 메뉴로 자신을 선택할 수 없습니다.");
        }
        Set<UUID> ancestorIds = getAncestorIds(upperId);
        if (ancestorIds.contains(selfId)) {
            throw new IllegalArgumentException("상위 메뉴를 해당 메뉴로 설정하면 순환 참조가 됩니다.");
        }
    }

    private Set<UUID> getAncestorIds(UUID id) {
        Set<UUID> visited = new HashSet<>();
        List<UUID> queue = new ArrayList<>();
        queue.add(id);
        while (!queue.isEmpty()) {
            UUID current = queue.remove(0);
            if (!visited.add(current)) continue;
            Optional<Menu> menu = menuRepository.findById(current);
            if (menu.isEmpty() || menu.get().getUpperId() == null) continue;
            queue.add(menu.get().getUpperId());
        }
        return visited;
    }

    /**
     * 권한·채널 조건 + 요청 필터(q, isActive, channel, upperId 등)
     */
    private Specification<Menu> spec(RequestContext ctx, Map<String, Object> filter) {
        Specification<Menu> result = CommonSpecifications.notDeleted();

        // INTERNAL 채널일 때만 비활성 메뉴 조회 가능
        if (ctx != null && ctx.getChannel() != null && Channel.EXTERNAL.equals(ctx.getChannel())) {
            result = result.and(CommonSpecifications.eqIfPresent("isActive", true));
        }

        // 채널 필터: 요청 채널·PUBLIC만 (메뉴바 노출용. 전체 조회는 GET /api/admin/menus 사용)
        if (ctx != null && ctx.getChannel() != null) {
            String channelName = ctx.getChannel().name();
            result = result.and((root, query, cb) -> {
                Predicate matchChannel = cb.equal(root.get("channel"), channelName);
                Predicate matchPublic = cb.equal(root.get("channel"), "PUBLIC");
                return cb.or(matchChannel, matchPublic);
            });
        }

        // 쿼리 파라미터 필터: q(코드·이름·설명 검색), isActive, channel, upperId
        result = CommonSpecifications.and(
                result,
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"code", "name", "description", "upperId"})
        );

        return result;
    }

    /** 관리용 spec: 채널/비활성 제한 없이, q·isActive·channel·upperId 필터만 */
    private Specification<Menu> specForManagement(Map<String, Object> filter) {
        Specification<Menu> result = CommonSpecifications.notDeleted();
        result = CommonSpecifications.and(
                result,
                CommonSpecifications.filterSpec(filter, PAGINATION_KEYS, "q", new String[]{"code", "name", "description", "upperId"})
        );
        return result;
    }
}
