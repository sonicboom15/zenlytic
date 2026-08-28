package com.example.configservice.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class ConfigDto {

    public record Request(
            @NotBlank(message = "Config key is required")
            String configKey,

            @NotBlank(message = "Config value is required")
            String configValue,

            String serviceName,
            String description,
            Boolean isSecret
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String configKey;
            private String configValue;
            private String serviceName;
            private String description;
            private Boolean isSecret = false;

            public Builder configKey(String configKey) { this.configKey = configKey; return this; }
            public Builder configValue(String configValue) { this.configValue = configValue; return this; }
            public Builder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder isSecret(Boolean isSecret) { this.isSecret = isSecret; return this; }

            public Request build() {
                return new Request(configKey, configValue, serviceName, description, isSecret);
            }
        }
    }

    public record Response(
            Long id,
            String configKey,
            String configValue,
            String serviceName,
            String description,
            Boolean isSecret,
            String tenantId,
            String source, // TENANT_OVERRIDE, GLOBAL_DEFAULT
            Instant createdAt
    ) {
        public String getConfigValue() { return configValue; }
        public String getSource() { return source; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String configKey;
            private String configValue;
            private String serviceName;
            private String description;
            private Boolean isSecret;
            private String tenantId;
            private String source;
            private Instant createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder configKey(String configKey) { this.configKey = configKey; return this; }
            public Builder configValue(String configValue) { this.configValue = configValue; return this; }
            public Builder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder isSecret(Boolean isSecret) { this.isSecret = isSecret; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
            public Builder source(String source) { this.source = source; return this; }
            public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

            public Response build() {
                return new Response(id, configKey, configValue, serviceName, description, isSecret, tenantId, source, createdAt);
            }
        }
    }
}
