package com.example.common.context;

import java.util.Collections;
import java.util.Map;

public record TenantContext(
        String tenantId,
        String tier,
        String status,
        Map<String, Object> metadata
) {
    public TenantContext(String tenantId, String tier, String status) {
        this(tenantId, tier, status, Collections.emptyMap());
    }

    public String getTenantId() { return tenantId; }
    public String getTier() { return tier; }
    public String getStatus() { return status; }
    public Map<String, Object> getMetadata() { return metadata; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String tier = "STARTER";
        private String status = "ACTIVE";
        private Map<String, Object> metadata = Collections.emptyMap();

        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder tier(String tier) { this.tier = tier; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder metadata(Map<String, Object> metadata) { this.metadata = metadata; return this; }

        public TenantContext build() {
            return new TenantContext(tenantId, tier, status, metadata);
        }
    }
}
