package com.jinyverse.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinyverse.backend.domain.common.util.JwtUtil;
import com.jinyverse.backend.domain.idempotency.service.IdempotencyService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<AppRequestContextFilter> appRequestContextFilter() {
        FilterRegistrationBean<AppRequestContextFilter> reg = new FilterRegistrationBean<>(new AppRequestContextFilter());
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE);
        reg.addUrlPatterns("/api/*", "/api/*/*", "/api/*/*/*", "/api/*/*/*/*");
        return reg;
    }

    @Bean
    public FilterRegistrationBean<CsrfProtectionFilter> csrfProtectionFilter(ObjectMapper objectMapper) {
        FilterRegistrationBean<CsrfProtectionFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CsrfProtectionFilter(objectMapper));
        registration.addUrlPatterns("/api/*", "/api/*/*", "/api/*/*/*", "/api/*/*/*/*");
        registration.setOrder(Ordered.LOWEST_PRECEDENCE - 2);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilter(
            JwtUtil jwtUtil,
            ObjectMapper objectMapper
    ) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new JwtAuthenticationFilter(jwtUtil, objectMapper));
        registration.addUrlPatterns("/api/*", "/api/*/*", "/api/*/*/*", "/api/*/*/*/*");
        registration.setOrder(Ordered.LOWEST_PRECEDENCE - 1);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<IdempotencyFilter> idempotencyFilter(
            IdempotencyService idempotencyService,
            ObjectMapper objectMapper
    ) {
        FilterRegistrationBean<IdempotencyFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new IdempotencyFilter(idempotencyService, objectMapper));
        registration.addUrlPatterns("/api/*", "/api/*/*", "/api/*/*/*", "/api/*/*/*/*");
        registration.setOrder(Ordered.LOWEST_PRECEDENCE);
        return registration;
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
