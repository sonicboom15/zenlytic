package com.example.common.context;

public final class TenantContextHolder {

    private static final ThreadLocal<TenantContext> CONTEXT = new ThreadLocal<>();

    private TenantContextHolder() {
    }

    public static void set(TenantContext context) {
        CONTEXT.set(context);
    }

    public static void setContext(TenantContext context) {
        CONTEXT.set(context);
    }

    public static void setTenantId(String tenantId) {
        if (tenantId == null) {
            clear();
        } else {
            CONTEXT.set(TenantContext.builder().tenantId(tenantId).build());
        }
    }

    public static TenantContext get() {
        return CONTEXT.get();
    }

    public static TenantContext getContext() {
        return CONTEXT.get();
    }

    public static String getTenantId() {
        TenantContext context = CONTEXT.get();
        return context != null ? context.tenantId() : "default";
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
