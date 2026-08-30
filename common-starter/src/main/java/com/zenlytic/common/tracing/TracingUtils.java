package com.zenlytic.common.tracing;

import java.util.UUID;

public final class TracingUtils {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String TRACEPARENT_HEADER = "traceparent";

    private TracingUtils() {
    }

    public static String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String generateSpanId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    public static String createTraceparent(String traceId, String spanId) {
        return String.format("00-%s-%s-01", traceId, spanId);
    }

    public static String extractTraceId(String traceparent) {
        if (traceparent != null && traceparent.startsWith("00-")) {
            String[] parts = traceparent.split("-");
            if (parts.length >= 2) {
                return parts[1];
            }
        }
        return generateTraceId();
    }
}
