package com.zenlytic.order.saga;

import com.zenlytic.common.saga.SagaContext;
import com.zenlytic.common.saga.SagaOrchestrator;
import com.zenlytic.common.saga.SagaStep;
import com.zenlytic.common.saga.SagaStepLog;
import com.zenlytic.order.entity.SagaInstanceEntity;
import com.zenlytic.order.entity.SagaStepLogEntity;
import com.zenlytic.order.repository.SagaInstanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderFulfillmentSagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(OrderFulfillmentSagaOrchestrator.class);

    private final SagaOrchestrator baseOrchestrator;
    private final SagaInstanceRepository sagaRepository;
    private final List<SagaStep<?>> sagaSteps;

    public OrderFulfillmentSagaOrchestrator(
            SagaOrchestrator baseOrchestrator,
            SagaInstanceRepository sagaRepository,
            CreatePendingOrderStep createPendingOrderStep,
            ReserveInventoryStep reserveInventoryStep,
            ProcessPaymentStep processPaymentStep,
            ConfirmOrderStep confirmOrderStep) {
        this.baseOrchestrator = baseOrchestrator;
        this.sagaRepository = sagaRepository;
        this.sagaSteps = List.of(
                createPendingOrderStep,
                reserveInventoryStep,
                processPaymentStep,
                confirmOrderStep
        );
    }

    public SagaContext runSaga(SagaContext context) {
        log.info("Starting Order Fulfillment Saga [{}] for Tenant [{}]", context.getSagaId(), context.getTenantId());

        // 1. Persist initial Saga Instance
        SagaInstanceEntity instance = SagaInstanceEntity.builder()
                .sagaId(context.getSagaId())
                .sagaType("ORDER_FULFILLMENT")
                .status("STARTED")
                .currentStep("INIT")
                .build();
        instance.setTenantId(context.getTenantId());
        sagaRepository.save(instance);

        // 2. Execute Saga Pipeline
        SagaContext result = baseOrchestrator.executeSaga(context, sagaSteps);

        // 3. Persist Final Saga State & Audit Timeline Logs
        instance.setStatus(result.getStatus().name());
        instance.setFailureReason(result.getFailureReason());

        for (SagaStepLog logEntry : result.getStepLogs()) {
            SagaStepLogEntity stepLogEntity = SagaStepLogEntity.builder()
                    .stepName(logEntry.stepName())
                    .status(logEntry.status())
                    .durationMs(logEntry.durationMs())
                    .errorMessage(logEntry.errorMessage())
                    .executedAt(logEntry.executedAt())
                    .build();
            instance.addStepLog(stepLogEntity);
        }

        sagaRepository.save(instance);
        log.info("Order Fulfillment Saga [{}] finished with status [{}]", result.getSagaId(), result.getStatus());

        return result;
    }
}
