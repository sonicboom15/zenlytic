package com.zenlytic.common.ratelimit;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(2)
public class RateLimitFilter extends OncePerRequestFilter {

    private final TenantRateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(TenantRateLimiterService rateLimiterService, ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        TenantContext tenantContext = TenantContextHolder.get();
        String tenantId = tenantContext != null ? tenantContext.tenantId() : "anonymous";
        String tier = tenantContext != null ? tenantContext.tier() : "STARTER";

        if (!rateLimiterService.tryAcquirePermission(tenantId, tier)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ErrorResponse error = ErrorResponse.builder()
                    .success(false)
                    .error("TOO_MANY_REQUESTS")
                    .message("Rate limit exceeded for tenant: " + tenantId)
                    .status(HttpStatus.TOO_MANY_REQUESTS.value())
                    .path(request.getRequestURI())
                    .correlationId(MDC.get("correlationId"))
                    .build();

            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
