package com.jinyverse.backend.config.resolver;

import com.jinyverse.backend.domain.common.util.Channel;
import com.jinyverse.backend.domain.common.util.RequestContext;
import com.jinyverse.backend.domain.common.util.RequestContextHolder;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Controller 파라미터 타입이 {@link RequestContext}이면 {@link RequestContextHolder}에서
 * 꺼내 자동 주입한다. 필터 체인(AppRequestContextFilter → JwtAuthenticationFilter)에서
 * 이미 설정된 완전한 컨텍스트를 재사용한다.
 */
public class RequestContextArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return RequestContext.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        RequestContext ctx = RequestContextHolder.get();
        return ctx != null ? ctx : RequestContext.anonymous(Channel.INTERNAL, null);
    }
}
