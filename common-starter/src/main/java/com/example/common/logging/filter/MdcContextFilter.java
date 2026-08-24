package com.example.common.logging.filter;

import com.example.common.context.TenantContextHolder;
import com.example.common.context.UserContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class MdcContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        MDC.put("clientIp", getClientIp(request));
        MDC.put("httpMethod", request.getMethod());
        MDC.put("requestUri", request.getRequestURI());

        String tenantId = TenantContextHolder.getTenantId();
        if (tenantId != null) {
            MDC.put("tenantId", tenantId);
        }

        String userId = UserContextHolder.getUserId();
        if (userId != null) {
            MDC.put("userId", userId);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("clientIp");
            MDC.remove("httpMethod");
            MDC.remove("requestUri");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
