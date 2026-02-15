package com.jinyverse.backend.config;

import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.ClientIpUtil;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AppRequestContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {
        Channel channel = Channel.fromHeader(request.getHeader("X-App-Channel"));
        String ip = ClientIpUtil.extractIp(request);
        RequestContextHolder.set(RequestContext.anonymous(channel, ip));
        try {
            chain.doFilter(request, response);
        } finally {
            RequestContextHolder.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return HttpMethod.OPTIONS.matches(request.getMethod());
    }
}
