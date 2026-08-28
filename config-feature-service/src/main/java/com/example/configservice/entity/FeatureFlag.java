package com.example.configservice.entity;

import com.example.common.entity.TenantAwareEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "feature_flags")
public class FeatureFlag extends TenantAwareEntity {

    @Column(name = "flag_key", nullable = false, length = 128)
    private String flagKey;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = false;

    @Column(name = "strategy", length = 32)
    private String strategy = "GLOBAL"; // GLOBAL, TIER, WHITELIST, PERCENTAGE

    @Column(name = "target_tier", length = 64)
    private String targetTier;

    @Column(name = "target_tenants", length = 1024)
    private String targetTenants;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "rollout_percentage", nullable = false)
    private Integer rolloutPercentage = 100;

    public FeatureFlag() {}

    public FeatureFlag(String flagKey, Boolean enabled, String strategy, String targetTier, String targetTenants, String description, Integer rolloutPercentage) {
        this.flagKey = flagKey;
        this.enabled = enabled != null ? enabled : false;
        this.strategy = strategy != null ? strategy : "GLOBAL";
        this.targetTier = targetTier;
        this.targetTenants = targetTenants;
        this.description = description;
        this.rolloutPercentage = rolloutPercentage != null ? rolloutPercentage : 100;
    }

    public String getFlagKey() { return flagKey; }
    public void setFlagKey(String flagKey) { this.flagKey = flagKey; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public String getTargetTier() { return targetTier; }
    public void setTargetTier(String targetTier) { this.targetTier = targetTier; }

    public String getTargetTenants() { return targetTenants; }
    public void setTargetTenants(String targetTenants) { this.targetTenants = targetTenants; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRolloutPercentage() { return rolloutPercentage; }
    public void setRolloutPercentage(Integer rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String flagKey;
        private Boolean enabled = false;
        private String strategy = "GLOBAL";
        private String targetTier;
        private String targetTenants;
        private String description;
        private Integer rolloutPercentage = 100;
        private String tenantId;

        public Builder flagKey(String flagKey) { this.flagKey = flagKey; return this; }
        public Builder enabled(Boolean enabled) { this.enabled = enabled; return this; }
        public Builder strategy(String strategy) { this.strategy = strategy; return this; }
        public Builder targetTier(String targetTier) { this.targetTier = targetTier; return this; }
        public Builder targetTenants(String targetTenants) { this.targetTenants = targetTenants; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder rolloutPercentage(Integer rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }

        public FeatureFlag build() {
            FeatureFlag flag = new FeatureFlag(flagKey, enabled, strategy, targetTier, targetTenants, description, rolloutPercentage);
            if (tenantId != null) {
                flag.setTenantId(tenantId);
            }
            return flag;
        }
    }
}
