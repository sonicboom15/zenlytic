package com.zenlytic.order.saga;

import com.zenlytic.common.saga.SagaContext;
import com.zenlytic.common.saga.SagaStep;
import com.zenlytic.order.entity.Order;
import com.zenlytic.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ConfirmOrderStep implements SagaStep<Void> {

    private static final Logger log = LoggerFactory.getLogger(ConfirmOrderStep.class);
    private final OrderRepository orderRepository;

    public ConfirmOrderStep(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getStepName() {
        return "Confirm Order";
    }

    @Override
    public boolean execute(SagaContext context) {
        String orderId = context.getPayload("orderId", String.class);
        String paymentRef = context.getPayload("paymentReference", String.class);

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found: " + orderId));

        order.setStatus("CONFIRMED");
        order.setPaymentReference(paymentRef);
        Order saved = orderRepository.save(order);

        context.setPayload("savedOrder", saved);
        log.info("Saga [{}]: Order [{}] confirmed with payment ref [{}]", context.getSagaId(), orderId, paymentRef);
        return true;
    }

    @Override
    public void compensate(SagaContext context) {
        String orderId = context.getPayload("orderId", String.class);
        if (orderId != null) {
            orderRepository.findByOrderId(orderId).ifPresent(order -> {
                order.setStatus("CANCELLED");
                orderRepository.save(order);
                log.info("Saga [{}]: Order [{}] status reset to CANCELLED", context.getSagaId(), orderId);
            });
        }
    }
}
