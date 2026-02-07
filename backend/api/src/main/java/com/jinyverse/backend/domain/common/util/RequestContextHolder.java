package com.jinyverse.backend.domain.common.util;

/**
 * 요청 스코프에서 현재 RequestContext를 보관.
 * JwtAuthenticationFilter에서 set, finally에서 clear 필수 (메모리 누수·스레드 재사용 방지).
 */
public final class RequestContextHolder {

    private static final ThreadLocal<RequestContext> HOLDER = new ThreadLocal<>();

    private RequestContextHolder() {
    }

    public static void set(RequestContext context) {
        HOLDER.set(context);
    }

    public static RequestContext get() {
        return HOLDER.get();
    }

    /** 필터에서 반드시 finally 블록에서 호출 */
    public static void clear() {
        HOLDER.remove();
    }
}
