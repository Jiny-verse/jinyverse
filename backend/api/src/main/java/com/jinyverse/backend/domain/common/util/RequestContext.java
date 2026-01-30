package com.jinyverse.backend.domain.common.util;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RequestContext {

    private final Channel channel;
    private final Role role;

    public static RequestContext of(Channel channel, Role role) {
        return new RequestContext(
                channel == null ? Channel.INTERNAL : channel,
                role
        );
    }

    public static RequestContext fromChannelHeader(String rawChannel) {
        return of(Channel.fromHeader(rawChannel), null);
    }

    public static RequestContext fromHeaders(String rawChannel, String rawRole) {
        return of(Channel.fromHeader(rawChannel), Role.fromHeader(rawRole));
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean hasRole() {
        return role != null;
    }
}
