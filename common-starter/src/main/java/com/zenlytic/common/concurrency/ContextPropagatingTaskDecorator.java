package com.zenlytic.common.concurrency;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContext;
import com.zenlytic.common.context.UserContextHolder;
import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

public class ContextPropagatingTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        // Capture context from parent thread
        Map<String, String> mdcContext = MDC.getCopyOfContextMap();
        TenantContext tenantContext = TenantContextHolder.getContext();
        UserContext userContext = UserContextHolder.getContext();
        SecurityContext securityContext = SecurityContextHolder.getContext();

        return () -> {
            try {
                // Restore context in worker thread
                if (mdcContext != null) {
                    MDC.setContextMap(mdcContext);
                }
                if (tenantContext != null) {
                    TenantContextHolder.setContext(tenantContext);
                }
                if (userContext != null) {
                    UserContextHolder.setContext(userContext);
                }
                if (securityContext != null) {
                    SecurityContextHolder.setContext(securityContext);
                }

                runnable.run();
            } finally {
                // Clean up worker thread
                MDC.clear();
                TenantContextHolder.clear();
                UserContextHolder.clear();
                SecurityContextHolder.clearContext();
            }
        };
    }
}
