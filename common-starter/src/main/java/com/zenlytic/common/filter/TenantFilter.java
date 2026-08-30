package com.zenlytic.common.filter;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
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
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class TenantFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-ID";
    public static final String DEFAULT_TENANT = "default";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = DEFAULT_TENANT;
        }

        TenantContextHolder.setContext(TenantContext.builder().tenantId(tenantId).build());
        MDC.put("tenantId", tenantId);
        response.setHeader(TENANT_HEADER, tenantId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
            MDC.remove("tenantId");
        }
    }
}
