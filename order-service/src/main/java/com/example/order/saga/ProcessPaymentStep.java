package com.example.order.saga;

import com.example.common.exception.PaymentFailedException;
import com.example.common.saga.SagaContext;
import com.example.common.saga.SagaStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class ProcessPaymentStep implements SagaStep<Void> {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentStep.class);

    @Override
    public String getStepName() {
        return "Process Payment";
    }

    @Override
    public boolean execute(SagaContext context) {
        BigDecimal totalAmount = context.getPayload("totalAmount", BigDecimal.class);
        String orderId = context.getPayload("orderId", String.class);

        log.info("Saga [{}]: Processing payment of {} for Order [{}]", context.getSagaId(), totalAmount, orderId);

        // Payment rule: amount > $50,000 simulates payment failure
        if (totalAmount != null && totalAmount.compareTo(new BigDecimal("50000.00")) > 0) {
            throw new PaymentFailedException("Transaction declined: Amount exceeds maximum single-order limit ($50,000)");
        }

        String paymentRef = "pay_" + UUID.randomUUID().toString().substring(0, 12);
        context.setPayload("paymentReference", paymentRef);
        log.info("Saga [{}]: Payment authorized successfully with ref [{}]", context.getSagaId(), paymentRef);
        return true;
    }

    @Override
    public void compensate(SagaContext context) {
        String paymentRef = context.getPayload("paymentReference", String.class);
        BigDecimal totalAmount = context.getPayload("totalAmount", BigDecimal.class);

        if (paymentRef != null) {
            log.info("Saga [{}]: Compensating - Refunding payment [{}] amount {}", context.getSagaId(), paymentRef, totalAmount);
        }
    }
}
