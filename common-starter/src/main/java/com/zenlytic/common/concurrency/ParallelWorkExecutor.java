package com.zenlytic.common.concurrency;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContext;
import com.zenlytic.common.context.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.function.Function;

@Component
public class ParallelWorkExecutor {

    private static final Logger log = LoggerFactory.getLogger(ParallelWorkExecutor.class);
    private final ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public <T, R> List<R> executeInParallel(Collection<T> items, Function<T, R> task) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        // Capture calling thread's context
        TenantContext capturedTenant = TenantContextHolder.get();
        UserContext capturedUser = UserContextHolder.get();
        Map<String, String> capturedMdc = MDC.getCopyOfContextMap();

        List<CompletableFuture<R>> futures = new ArrayList<>();

        for (T item : items) {
            CompletableFuture<R> future = CompletableFuture.supplyAsync(() -> {
                // Restore context on Virtual Thread
                if (capturedTenant != null) TenantContextHolder.set(capturedTenant);
                if (capturedUser != null) UserContextHolder.set(capturedUser);
                if (capturedMdc != null) MDC.setContextMap(capturedMdc);

                try {
                    return task.apply(item);
                } finally {
                    TenantContextHolder.clear();
                    UserContextHolder.clear();
                    MDC.clear();
                }
            }, virtualThreadExecutor);

            futures.add(future);
        }

        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }
}
