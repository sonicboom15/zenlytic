package com.zenlytic.common.context;

import java.util.Collections;
import java.util.Set;

public record UserContext(
        String userId,
        String email,
        String tenantId,
        Set<String> roles,
        Set<String> permissions
) {
    public UserContext(String userId, String email, String tenantId) {
        this(userId, email, tenantId, Collections.emptySet(), Collections.emptySet());
    }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getTenantId() { return tenantId; }
    public Set<String> getRoles() { return roles; }
    public Set<String> getPermissions() { return permissions; }

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }

    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String userId;
        private String email;
        private String tenantId;
        private Set<String> roles = Collections.emptySet();
        private Set<String> permissions = Collections.emptySet();

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder roles(Set<String> roles) { this.roles = roles != null ? roles : Collections.emptySet(); return this; }
        public Builder permissions(Set<String> permissions) { this.permissions = permissions != null ? permissions : Collections.emptySet(); return this; }

        public UserContext build() {
            return new UserContext(userId, email, tenantId, roles, permissions);
        }
    }
}
