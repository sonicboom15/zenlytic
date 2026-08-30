package com.zenlytic.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public class LoginDto {

    public record Request(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            String password,

            String tenantId
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String email;
            private String password;
            private String tenantId;

            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }

            public Request build() {
                return new Request(email, password, tenantId);
            }
        }
    }

    public record Response(
            String token,
            String userId,
            String email,
            String tenantId,
            Set<String> roles,
            Set<String> permissions
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private String userId;
            private String email;
            private String tenantId;
            private Set<String> roles;
            private Set<String> permissions;

            public Builder token(String token) { this.token = token; return this; }
            public Builder userId(String userId) { this.userId = userId; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
            public Builder roles(Set<String> roles) { this.roles = roles; return this; }
            public Builder permissions(Set<String> permissions) { this.permissions = permissions; return this; }

            public Response build() {
                return new Response(token, userId, email, tenantId, roles, permissions);
            }
        }
    }
}
