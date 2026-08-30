package com.zenlytic.common.concurrency;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContext;
import com.zenlytic.common.context.UserContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ParallelWorkExecutorTest {

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
        UserContextHolder.clear();
        MDC.clear();
    }

    @Test
    @DisplayName("ParallelWorkExecutor should execute tasks concurrently with context propagation")
    void testParallelExecutionWithContextPropagation() {
        ParallelWorkExecutor executor = new ParallelWorkExecutor();

        TenantContextHolder.setTenantId("tenant-globex");
        UserContextHolder.setContext(UserContext.builder()
                .userId("user-worker-1")
                .tenantId("tenant-globex")
                .roles(Set.of("USER"))
                .build());
        MDC.put("correlationId", "trace-xyz-123");

        List<Integer> inputNumbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        List<String> results = executor.executeInParallel(inputNumbers, num -> {
            // Assert that worker thread inherited the context
            String workerTenant = TenantContextHolder.getTenantId();
            String workerUser = UserContextHolder.getUserId();
            String workerCorrelation = MDC.get("correlationId");

            return String.format("Num:%d|Tenant:%s|User:%s|Trace:%s",
                    num * 2, workerTenant, workerUser, workerCorrelation);
        });

        assertEquals(10, results.size());
        for (String res : results) {
            assertTrue(res.contains("Tenant:tenant-globex"));
            assertTrue(res.contains("User:user-worker-1"));
            assertTrue(res.contains("Trace:trace-xyz-123"));
        }
    }
}
