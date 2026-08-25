package com.example.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantRegistrationDto(
        @NotBlank(message = "Tenant ID is required")
        @Size(min = 3, max = 64, message = "Tenant ID must be between 3 and 64 characters")
        String tenantId,

        @NotBlank(message = "Tenant name is required")
        String name,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid email format")
        String adminEmail,

        @NotBlank(message = "Admin password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String adminPassword,

        String tier
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String name;
        private String adminEmail;
        private String adminPassword;
        private String tier = "STARTER";

        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder adminEmail(String adminEmail) { this.adminEmail = adminEmail; return this; }
        public Builder adminPassword(String adminPassword) { this.adminPassword = adminPassword; return this; }
        public Builder tier(String tier) { this.tier = tier; return this; }

        public TenantRegistrationDto build() {
            return new TenantRegistrationDto(tenantId, name, adminEmail, adminPassword, tier);
        }
    }
}
