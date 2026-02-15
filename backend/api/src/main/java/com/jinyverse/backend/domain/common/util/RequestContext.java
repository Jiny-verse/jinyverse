package com.jinyverse.backend.domain.common.util;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RequestContext {

    private final Channel channel;
    private final Role role;
    private final UUID userId;
    private final String username;
    private final String ipAddress;

    public static RequestContext of(Channel channel, Role role) {
        return new RequestContext(
                channel == null ? Channel.INTERNAL : channel,
                role,
                null,
                null,
                null
        );
    }

    public static RequestContext fromChannelHeader(String rawChannel) {
        return of(Channel.fromHeader(rawChannel), null);
    }

    public static RequestContext fromHeaders(String rawChannel, String rawRole) {
        return of(Channel.fromHeader(rawChannel), Role.fromHeader(rawRole));
    }

    /**
     * JWT 액세스 토큰에서 현재 유저 정보로 RequestContext 생성.
     * 채널은 INTERNAL, role은 토큰 claim에서 파싱.
     */
    public static RequestContext fromToken(JwtUtil jwtUtil, String token, String ipAddress) {
        UUID userId = jwtUtil.getUserIdFromToken(token);
        String roleStr = jwtUtil.getRoleFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        return new RequestContext(
                Channel.INTERNAL,
                Role.fromHeader(roleStr),
                userId,
                username,
                ipAddress
        );
    }

    /** 비인증 요청용 익명 컨텍스트 (IP·Channel만 설정) */
    public static RequestContext anonymous(Channel channel, String ipAddress) {
        return new RequestContext(channel, null, null, null, ipAddress);
    }

    /** 기존 IP·Channel 유지하면서 인증 정보 추가 */
    public RequestContext withAuth(UUID userId, String username, Role role) {
        return new RequestContext(this.channel, role, userId, username, this.ipAddress);
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean hasRole() {
        return role != null;
    }

    /** 인증된 유저인지(토큰 기반 컨텍스트인지) */
    public boolean isAuthenticated() {
        return userId != null;
    }

    /** Service 레이어에서 현재 유저 ID 조회 (인증 필수 경로에서만 사용) */
    public UUID getCurrentUserId() {
        return userId;
    }
}
