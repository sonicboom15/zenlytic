package com.zenlytic.configservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class FeatureFlagDto {

    public record Request(
            @NotBlank(message = "Flag key is required")
            String flagKey,

            @NotNull(message = "Enabled status is required")
            Boolean enabled,

            String strategy,
            String targetTier,
            String targetTenants,
            String description,

            @Min(0) @Max(100)
            Integer rolloutPercentage
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String flagKey;
            private Boolean enabled = false;
            private String strategy = "GLOBAL";
            private String targetTier;
            private String targetTenants;
            private String description;
            private Integer rolloutPercentage = 100;

            public Builder flagKey(String flagKey) { this.flagKey = flagKey; return this; }
            public Builder enabled(Boolean enabled) { this.enabled = enabled; return this; }
            public Builder strategy(String strategy) { this.strategy = strategy; return this; }
            public Builder targetTier(String targetTier) { this.targetTier = targetTier; return this; }
            public Builder targetTenants(String targetTenants) { this.targetTenants = targetTenants; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder rolloutPercentage(Integer rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; return this; }

            public Request build() {
                return new Request(flagKey, enabled, strategy, targetTier, targetTenants, description, rolloutPercentage);
            }
        }
    }

    public record Response(
            Long id,
            String flagKey,
            Boolean enabled,
            String strategy,
            String targetTier,
            String targetTenants,
            String description,
            Integer rolloutPercentage,
            String tenantId,
            Instant createdAt
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String flagKey;
            private Boolean enabled;
            private String strategy = "GLOBAL";
            private String targetTier;
            private String targetTenants;
            private String description;
            private Integer rolloutPercentage;
            private String tenantId;
            private Instant createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder flagKey(String flagKey) { this.flagKey = flagKey; return this; }
            public Builder enabled(Boolean enabled) { this.enabled = enabled; return this; }
            public Builder strategy(String strategy) { this.strategy = strategy; return this; }
            public Builder targetTier(String targetTier) { this.targetTier = targetTier; return this; }
            public Builder targetTenants(String targetTenants) { this.targetTenants = targetTenants; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder rolloutPercentage(Integer rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
            public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

            public Response build() {
                return new Response(id, flagKey, enabled, strategy, targetTier, targetTenants, description, rolloutPercentage, tenantId, createdAt);
            }
        }
    }

    public record EvaluationResult(
            boolean enabled,
            String flagKey,
            String reason
    ) {}
}
