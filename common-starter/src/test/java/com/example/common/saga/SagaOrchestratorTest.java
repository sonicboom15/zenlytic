package com.example.common.saga;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SagaOrchestratorTest {

    private SagaOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        orchestrator = new SagaOrchestrator();
    }

    @Test
    @DisplayName("Should successfully execute all saga steps")
    void testSuccessfulSaga() {
        List<String> executionAudit = new ArrayList<>();

        SagaStep<String> step1 = new TestSagaStep("Step 1", executionAudit, true, false);
        SagaStep<String> step2 = new TestSagaStep("Step 2", executionAudit, true, false);
        SagaStep<String> step3 = new TestSagaStep("Step 3", executionAudit, true, false);

        SagaContext context = SagaContext.builder()
                .sagaType("ORDER_FULFILLMENT")
                .tenantId("tenant-acme")
                .userId("user-101")
                .build();

        SagaContext result = orchestrator.executeSaga(context, List.of(step1, step2, step3), "input-data");

        assertEquals(SagaStatus.COMPLETED, result.getStatus());
        assertEquals(3, result.getStepLogs().size());
        assertEquals(List.of("EXECUTE: Step 1", "EXECUTE: Step 2", "EXECUTE: Step 3"), executionAudit);
        assertNull(result.getFailureReason());
        assertNotNull(result.getCompletedAt());
    }

    @Test
    @DisplayName("Should compensate previous steps in reverse order when a step fails")
    void testCompensatingSaga() {
        List<String> executionAudit = new ArrayList<>();

        SagaStep<String> step1 = new TestSagaStep("Reserve Inventory", executionAudit, true, false);
        SagaStep<String> step2 = new TestSagaStep("Process Payment", executionAudit, true, false);
        SagaStep<String> step3 = new TestSagaStep("Arrange Shipping", executionAudit, false, true); // Fails

        SagaContext context = SagaContext.builder()
                .sagaType("ORDER_FULFILLMENT")
                .tenantId("tenant-acme")
                .userId("user-101")
                .build();

        SagaContext result = orchestrator.executeSaga(context, List.of(step1, step2, step3), "order-123");

        assertEquals(SagaStatus.COMPENSATED, result.getStatus());
        assertEquals(5, result.getStepLogs().size()); // 3 executions + 2 compensations
        assertEquals(
                List.of("EXECUTE: Reserve Inventory", "EXECUTE: Process Payment", "EXECUTE: Arrange Shipping",
                        "COMPENSATE: Process Payment", "COMPENSATE: Reserve Inventory"),
                executionAudit
        );
        assertNotNull(result.getFailureReason());
    }

    private static class TestSagaStep implements SagaStep<String> {
        private final String name;
        private final List<String> auditList;
        private final boolean shouldSucceed;
        private final boolean throwException;

        TestSagaStep(String name, List<String> auditList, boolean shouldSucceed, boolean throwException) {
            this.name = name;
            this.auditList = auditList;
            this.shouldSucceed = shouldSucceed;
            this.throwException = throwException;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public boolean execute(SagaContext context, String input) {
            auditList.add("EXECUTE: " + name);
            if (throwException) {
                throw new RuntimeException("Simulated failure in " + name);
            }
            return shouldSucceed;
        }

        @Override
        public void compensate(SagaContext context, String input) {
            auditList.add("COMPENSATE: " + name);
        }
    }
}
