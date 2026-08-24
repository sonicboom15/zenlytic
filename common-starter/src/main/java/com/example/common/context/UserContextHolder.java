package com.example.common.context;

public final class UserContextHolder {

    private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal<>();

    private UserContextHolder() {
    }

    public static void set(UserContext context) {
        CONTEXT.set(context);
    }

    public static void setContext(UserContext context) {
        CONTEXT.set(context);
    }

    public static UserContext get() {
        return CONTEXT.get();
    }

    public static UserContext getContext() {
        return CONTEXT.get();
    }

    public static String getUserId() {
        UserContext context = CONTEXT.get();
        return context != null ? context.userId() : null;
    }

    public static String getTenantId() {
        UserContext context = CONTEXT.get();
        return context != null ? context.tenantId() : null;
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
