package com.jinyverse.backend.domain.common.util;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;

public final class CommonSpecifications {

    private CommonSpecifications() {}

    public static <T> Specification<T> and(Specification<T> left, Specification<T> right) {
        if (left == null) return right;
        if (right == null) return left;
        return left.and(right);
    }

    public static <T> Specification<T> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static <T> Specification<T> eqIfPresent(String field, Object value) {
        if (value == null) return null;
        return (root, query, cb) -> cb.equal(root.get(field), value);
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
}
