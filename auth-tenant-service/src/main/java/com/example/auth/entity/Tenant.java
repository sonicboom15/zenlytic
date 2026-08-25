package com.example.auth.entity;

import com.example.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true, length = 64)
    private String tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "tier", nullable = false)
    private String tier = "STARTER"; // STARTER, GROWTH, ENTERPRISE

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, PENDING

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "webhook_secret")
    private String webhookSecret;

    public Tenant() {}

    public Tenant(String tenantId, String name, String tier, String status, String webhookUrl, String webhookSecret) {
        this.tenantId = tenantId;
        this.name = name;
        this.tier = tier != null ? tier : "STARTER";
        this.status = status != null ? status : "ACTIVE";
        this.webhookUrl = webhookUrl;
        this.webhookSecret = webhookSecret;
    }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }

    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String name;
        private String tier = "STARTER";
        private String status = "ACTIVE";
        private String webhookUrl;
        private String webhookSecret;

        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder tier(String tier) { this.tier = tier; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder webhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; return this; }
        public Builder webhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; return this; }

        public Tenant build() {
            return new Tenant(tenantId, name, tier, status, webhookUrl, webhookSecret);
        }
    }
}
