package com.example.common.model;

import com.example.common.context.TenantContextHolder;
import com.example.common.context.UserContextHolder;
import org.slf4j.MDC;

import java.time.Instant;
import java.util.UUID;

public record EventEnvelope<T>(
        String eventId,
        String eventType,
        String tenantId,
        String userId,
        String correlationId,
        Instant timestamp,
        T payload
) {
    public static <T> EventEnvelope<T> of(String eventType, T payload) {
        return new EventEnvelope<>(
                UUID.randomUUID().toString(),
                eventType,
                TenantContextHolder.getTenantId(),
                UserContextHolder.getUserId(),
                MDC.get("correlationId"),
                Instant.now(),
                payload
        );
    }
}
