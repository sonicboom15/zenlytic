package com.example.common.context;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TenantAndUserContextTest {

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("TenantContextHolder should properly set, retrieve and clear context")
    void testTenantContextHolder() {
        assertEquals("default", TenantContextHolder.getTenantId());

        TenantContextHolder.setTenantId("tenant-acme");
        assertEquals("tenant-acme", TenantContextHolder.getTenantId());

        TenantContextHolder.clear();
        assertEquals("default", TenantContextHolder.getTenantId());
    }

    @Test
    @DisplayName("UserContextHolder and UserContext should handle roles and permissions")
    void testUserContext() {
        UserContext user = UserContext.builder()
                .userId("usr-123")
                .email("admin@acme.com")
                .tenantId("tenant-acme")
                .roles(Set.of("ADMIN", "USER"))
                .permissions(Set.of("product:read", "product:write"))
                .build();

        UserContextHolder.setContext(user);

        assertEquals("usr-123", UserContextHolder.getUserId());
        assertEquals("tenant-acme", UserContextHolder.getTenantId());
        assertTrue(user.hasRole("ADMIN"));
        assertFalse(user.hasRole("SUPERADMIN"));
        assertTrue(user.hasPermission("product:read"));
        assertFalse(user.hasPermission("product:delete"));

        UserContextHolder.clear();
        assertNull(UserContextHolder.getUserId());
    }
}
