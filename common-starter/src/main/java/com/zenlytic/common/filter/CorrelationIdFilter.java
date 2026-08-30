package com.zenlytic.common.filter;

import com.zenlytic.common.tracing.TracingUtils;
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
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String correlationId = request.getHeader(TracingUtils.CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        String traceparent = request.getHeader(TracingUtils.TRACEPARENT_HEADER);
        String traceId = TracingUtils.extractTraceId(traceparent);
        String spanId = TracingUtils.generateSpanId();

        MDC.put("correlationId", correlationId);
        MDC.put("traceId", traceId);
        MDC.put("spanId", spanId);

        response.setHeader(TracingUtils.CORRELATION_ID_HEADER, correlationId);
        response.setHeader(TracingUtils.TRACEPARENT_HEADER, TracingUtils.createTraceparent(traceId, spanId));

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
            MDC.remove("traceId");
            MDC.remove("spanId");
        }
    }
}
