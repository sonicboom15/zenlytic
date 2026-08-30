package com.zenlytic.configservice.entity;

import com.zenlytic.common.entity.TenantAwareEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "config_entries")
public class ConfigEntry extends TenantAwareEntity {

    @Column(name = "config_key", nullable = false, length = 128)
    private String configKey;

    @Column(name = "config_value", nullable = false, length = 2048)
    private String configValue;

    @Column(name = "service_name", length = 64)
    private String serviceName;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "is_secret", nullable = false)
    private Boolean isSecret = false;

    public ConfigEntry() {}

    public ConfigEntry(String configKey, String configValue, String serviceName, String description, Boolean isSecret) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.serviceName = serviceName;
        this.description = description;
        this.isSecret = isSecret != null ? isSecret : false;
    }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }

    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsSecret() { return isSecret; }
    public void setIsSecret(Boolean isSecret) { this.isSecret = isSecret; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String configKey;
        private String configValue;
        private String serviceName;
        private String description;
        private String tenantId;
        private Boolean isSecret = false;

        public Builder configKey(String configKey) { this.configKey = configKey; return this; }
        public Builder configValue(String configValue) { this.configValue = configValue; return this; }
        public Builder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder isSecret(Boolean isSecret) { this.isSecret = isSecret; return this; }

        public ConfigEntry build() {
            ConfigEntry entry = new ConfigEntry(configKey, configValue, serviceName, description, isSecret);
            if (tenantId != null) {
                entry.setTenantId(tenantId);
            }
            return entry;
        }
    }
}
