package com.zenlytic.auth.dto;

import java.time.Instant;

public record TenantResponseDto(
        String tenantId,
        String name,
        String tier,
        String status,
        String token,
        Instant createdAt
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String name;
        private String tier;
        private String status;
        private String token;
        private Instant createdAt = Instant.now();

        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder tier(String tier) { this.tier = tier; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder token(String token) { this.token = token; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public TenantResponseDto build() {
            return new TenantResponseDto(tenantId, name, tier, status, token, createdAt);
        }
    }
}
