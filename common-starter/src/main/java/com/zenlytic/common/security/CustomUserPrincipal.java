package com.zenlytic.common.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CustomUserPrincipal implements UserDetails {

    private final String userId;
    private final String email;
    private final String password;
    private final String tenantId;
    private final Set<String> roles;
    private final Set<String> permissions;

    public CustomUserPrincipal(String userId, String email, String password, String tenantId, Set<String> roles, Set<String> permissions) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.tenantId = tenantId;
        this.roles = roles != null ? roles : Collections.emptySet();
        this.permissions = permissions != null ? permissions : Collections.emptySet();
    }

    public String getUserId() { return userId; }
    public String getTenantId() { return tenantId; }
    public Set<String> getRoles() { return roles; }
    public Set<String> getPermissions() { return permissions; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Stream<GrantedAuthority> roleAuths = roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r));
        Stream<GrantedAuthority> permAuths = permissions.stream().map(SimpleGrantedAuthority::new);
        return Stream.concat(roleAuths, permAuths).collect(Collectors.toSet());
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String userId;
        private String email;
        private String password;
        private String tenantId;
        private Set<String> roles = Collections.emptySet();
        private Set<String> permissions = Collections.emptySet();

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder roles(Set<String> roles) { this.roles = roles; return this; }
        public Builder permissions(Set<String> permissions) { this.permissions = permissions; return this; }

        public CustomUserPrincipal build() {
            return new CustomUserPrincipal(userId, email, password, tenantId, roles, permissions);
        }
    }
}
