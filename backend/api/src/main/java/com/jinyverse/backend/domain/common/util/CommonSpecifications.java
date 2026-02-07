package com.jinyverse.backend.domain.common.util;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public final class CommonSpecifications {

    private CommonSpecifications() {}

    /** 쿼리 파라미터 중 엔티티 필터가 아닌 것 (spec에 넣지 않음) */
    public static final Set<String> PAGINATION_KEYS = Set.of("page", "size", "sort");

    public static <T> Specification<T> and(Specification<T> left, Specification<T> right) {
        if (left == null) return right;
        if (right == null) return left;
        return left.and(right);
    }

    public static <T> Specification<T> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    /**
     * 필드값이 있으면 equal 조건 추가.
     * - "true"/"false" 문자열은 Boolean으로 변환.
     * - 엔티티 필드가 UUID인데 값이 String이면 UUID로 파싱 (요청 파라미터는 보통 String으로 옴).
     */
    public static <T> Specification<T> eqIfPresent(String field, Object value) {
        if (value == null) return null;
        final Object finalValue = value instanceof String str && ("true".equals(str) || "false".equals(str))
                ? Boolean.parseBoolean(str)
                : value;
        return (root, query, cb) -> {
            Path<?> path = root.get(field);
            Object toUse = finalValue;
            if (path.getJavaType() == UUID.class && finalValue instanceof String s) {
                try {
                    toUse = UUID.fromString(s);
                } catch (IllegalArgumentException e) {
                    return cb.disjunction();
                }
            }
            return cb.equal(path, toUse);
        };
    }

    public static <T> Specification<T> andEqAll(Specification<T> spec, Map<String, Object> fields) {
        for (Map.Entry<String, Object> entry : fields.entrySet()) {
            spec = and(spec, eqIfPresent(entry.getKey(), entry.getValue()));
        }
        return spec;
    }

    public static <T> Specification<T> likeContainsIfPresent(String field, String value) {
        if (value == null || value.isBlank()) return null;
        String pattern = "%" + value.trim() + "%";
        return (root, query, cb) -> cb.like(root.get(field), pattern);
    }

    public static <T> Specification<T> gteIfPresent(String field, LocalDateTime value) {
        if (value == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get(field), value);
    }

    public static <T> Specification<T> lteIfPresent(String field, LocalDateTime value) {
        if (value == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get(field), value);
    }

    public static <T> Specification<T> keywordLikeAny(String keyword, String... fields) {
        if (keyword == null || keyword.isBlank()) return null;
        if (fields == null || fields.length == 0) return null;
        String pattern = "%" + keyword.trim() + "%";
        return (root, query, cb) -> cb.or(
                Arrays.stream(fields)
                        .map(f -> cb.like(root.get(f), pattern))
                        .toArray(jakarta.persistence.criteria.Predicate[]::new)
        );
    }

    /**
     * 쿼리 파라미터 Map으로 필터 전용 Specification 생성.
     * - skipKeys(page, size, sort 등) 제외
     * - searchKey(q 등)는 keywordLikeAny(searchFields)로 처리
     * - 그 외 키는 eq 조건으로 적용. "true"/"false" 문자열은 Boolean으로 변환 (엔티티 Boolean 필드와 타입 일치)
     */
    public static <T> Specification<T> filterSpec(
            Map<String, Object> filter,
            Set<String> skipKeys,
            String searchKey,
            String[] searchFields
    ) {
        if (filter == null || filter.isEmpty()) return null;
        Specification<T> s = null;
        Object searchValue = filter.get(searchKey);
        if (searchKey != null && searchFields != null && searchFields.length > 0
                && searchValue != null && !searchValue.toString().isBlank()) {
            s = keywordLikeAny(searchValue.toString(), searchFields);
        }
        for (Map.Entry<String, Object> entry : filter.entrySet()) {
            String key = entry.getKey();
            if (skipKeys != null && skipKeys.contains(key)) continue;
            if (searchKey != null && searchKey.equals(key)) continue;
            Object val = entry.getValue();
            if (val instanceof String str && ("true".equals(str) || "false".equals(str))) {
                val = Boolean.parseBoolean(str);
            }
            s = and(s, eqIfPresent(key, val));
        }
        return s;
    }
}
