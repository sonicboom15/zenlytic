package com.example.order.saga;

import com.example.common.saga.SagaContext;
import com.example.common.saga.SagaStep;
import com.example.order.dto.OrderDto;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class CreatePendingOrderStep implements SagaStep<Void> {

    private static final Logger log = LoggerFactory.getLogger(CreatePendingOrderStep.class);
    private final OrderRepository orderRepository;

    public CreatePendingOrderStep(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getStepName() {
        return "Create Pending Order";
    }

    @Override
    public boolean execute(SagaContext context) {
        OrderDto.CreateRequest request = context.getPayload("orderRequest", OrderDto.CreateRequest.class);
        String userId = context.getPayload("userId", String.class);
        String idempotencyKey = context.getPayload("idempotencyKey", String.class);

        String orderId = "ord-" + UUID.randomUUID().toString().substring(0, 8);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = Order.builder()
                .orderId(orderId)
                .userId(userId != null ? userId : "anonymous")
                .status("PENDING")
                .idempotencyKey(idempotencyKey)
                .build();
        order.setTenantId(context.getTenantId());

        for (OrderDto.ItemRequest itemReq : request.items()) {
            BigDecimal subtotal = itemReq.unitPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .sku(itemReq.sku())
                    .productName(itemReq.productName())
                    .unitPrice(itemReq.unitPrice())
                    .quantity(itemReq.quantity())
                    .subtotal(subtotal)
                    .build();
            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        context.setPayload("orderId", orderId);
        context.setPayload("totalAmount", totalAmount);
        context.setPayload("savedOrder", savedOrder);

        log.info("Saga [{}]: Pending Order [{}] created with total {}", context.getSagaId(), orderId, totalAmount);
        return true;
    }

    @Override
    public void compensate(SagaContext context) {
        String orderId = context.getPayload("orderId", String.class);
        if (orderId != null) {
            orderRepository.findByOrderId(orderId).ifPresent(order -> {
                order.setStatus("FAILED");
                orderRepository.save(order);
                log.info("Saga [{}]: Compensated Order [{}] -> status set to FAILED", context.getSagaId(), orderId);
            });
        }
    }
}
