package com.zenlytic.common.model;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContextHolder;
import org.slf4j.MDC;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String correlationId,
        String tenantId,
        String userId,
        Instant timestamp
) {
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(
                true,
                message,
                data,
                MDC.get("correlationId"),
                TenantContextHolder.getTenantId(),
                UserContextHolder.getUserId(),
                Instant.now()
        );
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok("Operation successful", data);
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return ok(message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(
                false,
                message,
                null,
                MDC.get("correlationId"),
                TenantContextHolder.getTenantId(),
                UserContextHolder.getUserId(),
                Instant.now()
        );
    }

    // Builder helper for flexibility
    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private boolean success = true;
        private String message;
        private T data;
        private String correlationId = MDC.get("correlationId");
        private String tenantId = TenantContextHolder.getTenantId();
        private String userId = UserContextHolder.getUserId();
        private Instant timestamp = Instant.now();

        public Builder<T> success(boolean success) { this.success = success; return this; }
        public Builder<T> message(String message) { this.message = message; return this; }
        public Builder<T> data(T data) { this.data = data; return this; }
        public Builder<T> correlationId(String correlationId) { this.correlationId = correlationId; return this; }
        public Builder<T> tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder<T> userId(String userId) { this.userId = userId; return this; }
        public Builder<T> timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(success, message, data, correlationId, tenantId, userId, timestamp);
        }
    }
}
