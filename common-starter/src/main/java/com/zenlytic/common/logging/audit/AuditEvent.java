package com.zenlytic.common.logging.audit;

import java.time.Instant;
import java.util.Map;

public record AuditEvent(
        String action,
        String resource,
        String resourceId,
        String tenantId,
        String userId,
        String status, // SUCCESS, FAILURE
        String clientIp,
        long executionDurationMs,
        Instant timestamp,
        Map<String, Object> details
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String action;
        private String resource;
        private String resourceId;
        private String tenantId;
        private String userId;
        private String status = "SUCCESS";
        private String clientIp;
        private long executionDurationMs;
        private Instant timestamp = Instant.now();
        private Map<String, Object> details;

        public Builder action(String action) { this.action = action; return this; }
        public Builder resource(String resource) { this.resource = resource; return this; }
        public Builder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder clientIp(String clientIp) { this.clientIp = clientIp; return this; }
        public Builder executionDurationMs(long executionDurationMs) { this.executionDurationMs = executionDurationMs; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder details(Map<String, Object> details) { this.details = details; return this; }

        public AuditEvent build() {
            return new AuditEvent(action, resource, resourceId, tenantId, userId, status, clientIp, executionDurationMs, timestamp, details);
        }
    }
}
