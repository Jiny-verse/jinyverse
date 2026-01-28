package com.jinyverse.backend.domain.common.util;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RequestContext {

    private final Channel channel;

    public static RequestContext of(Channel channel) {
        return new RequestContext(channel == null ? Channel.INTERNAL : channel);
    }

    public static RequestContext fromChannelHeader(String rawChannel) {
        return of(Channel.fromHeader(rawChannel));
    }
}
