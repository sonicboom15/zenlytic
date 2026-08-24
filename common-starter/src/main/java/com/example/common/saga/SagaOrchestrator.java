package com.example.common.saga;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class SagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(SagaOrchestrator.class);

    public SagaContext executeSaga(SagaContext context, List<? extends SagaStep<?>> steps) {
        return executeSagaInternal(context, steps, null);
    }

    public <T> SagaContext executeSaga(SagaContext context, List<SagaStep<T>> steps, T payload) {
        return executeSagaInternal(context, steps, payload);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private <T> SagaContext executeSagaInternal(SagaContext context, List steps, T payload) {
        log.info("Starting Saga [{}] of type [{}] for tenant [{}]",
                context.getSagaId(), context.getSagaType(), context.getTenantId());

        List<SagaStep> executedSteps = new ArrayList<>();
        boolean sagaFailed = false;

        for (Object obj : steps) {
            SagaStep step = (SagaStep) obj;
            context.setCurrentStep(step.getStepName());
            long startTime = System.currentTimeMillis();

            try {
                log.info("Saga [{}]: Executing step [{}]", context.getSagaId(), step.getStepName());
                boolean success = payload != null ? step.execute(context, payload) : step.execute(context);
                long duration = System.currentTimeMillis() - startTime;

                if (success) {
                    executedSteps.add(step);
                    context.addStepLog(new SagaStepLog(step.getStepName(), "SUCCESS", null, duration, Instant.now()));
                } else {
                    sagaFailed = true;
                    context.setFailureReason("Step " + step.getStepName() + " returned false");
                    context.addStepLog(new SagaStepLog(step.getStepName(), "FAILED", context.getFailureReason(), duration, Instant.now()));
                    break;
                }
            } catch (Exception ex) {
                sagaFailed = true;
                long duration = System.currentTimeMillis() - startTime;
                context.setFailureReason("Step " + step.getStepName() + " threw exception: " + ex.getMessage());
                context.addStepLog(new SagaStepLog(step.getStepName(), "FAILED", ex.getMessage(), duration, Instant.now()));
                log.error("Saga [{}]: Step [{}] failed with exception: {}", context.getSagaId(), step.getStepName(), ex.getMessage(), ex);
                break;
            }
        }

        if (sagaFailed) {
            log.warn("Saga [{}] failed at step [{}]. Initiating reverse compensation rollback...",
                    context.getSagaId(), context.getCurrentStep());
            context.setStatus(SagaStatus.COMPENSATING);
            rollback(context, executedSteps, payload);
            context.setStatus(SagaStatus.COMPENSATED);
        } else {
            context.setStatus(SagaStatus.COMPLETED);
            log.info("Saga [{}] completed successfully!", context.getSagaId());
        }

        context.setCompletedAt(Instant.now());
        return context;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private <T> void rollback(SagaContext context, List<SagaStep> executedSteps, T payload) {
        List<SagaStep> reverseSteps = new ArrayList<>(executedSteps);
        Collections.reverse(reverseSteps);

        for (SagaStep step : reverseSteps) {
            long startTime = System.currentTimeMillis();
            try {
                log.info("Saga [{}]: Compensating step [{}]", context.getSagaId(), step.getStepName());
                if (payload != null) {
                    step.compensate(context, payload);
                } else {
                    step.compensate(context);
                }
                long duration = System.currentTimeMillis() - startTime;
                context.addStepLog(new SagaStepLog(step.getStepName(), "COMPENSATED", null, duration, Instant.now()));
            } catch (Exception ex) {
                long duration = System.currentTimeMillis() - startTime;
                log.error("Saga [{}]: Failed to compensate step [{}]: {}", context.getSagaId(), step.getStepName(), ex.getMessage(), ex);
                context.addStepLog(new SagaStepLog(step.getStepName(), "COMPENSATION_FAILED", ex.getMessage(), duration, Instant.now()));
            }
        }
    }
}
