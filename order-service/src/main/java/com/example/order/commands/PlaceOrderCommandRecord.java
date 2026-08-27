package com.example.order.commands;

import com.example.common.context.TenantContextHolder;
import com.example.common.context.UserContextHolder;
import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.saga.SagaContext;
import com.example.order.dto.OrderDto;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.saga.OrderFulfillmentSagaOrchestrator;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.stream.Collectors;

public class PlaceOrderCommandRecord {

    public record Command(OrderDto.CreateRequest request) implements com.example.common.cqrs.command.Command<OrderDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, OrderDto.Response> {

        private final OrderFulfillmentSagaOrchestrator sagaOrchestrator;

        public Handler(OrderFulfillmentSagaOrchestrator sagaOrchestrator) {
            this.sagaOrchestrator = sagaOrchestrator;
        }

        @Override
        public OrderDto.Response handle(Command command) {
            OrderDto.CreateRequest request = command.request();
            String tenantId = TenantContextHolder.getTenantId();
            String userId = UserContextHolder.getUserId();

            String sagaId = "saga-" + UUID.randomUUID().toString().substring(0, 8);

            SagaContext context = SagaContext.builder()
                    .sagaId(sagaId)
                    .sagaType("ORDER_FULFILLMENT")
                    .tenantId(tenantId)
                    .build();

            context.setPayload("orderRequest", request);
            context.setPayload("userId", userId);
            context.setPayload("idempotencyKey", request.idempotencyKey());

            SagaContext result = sagaOrchestrator.runSaga(context);

            Order savedOrder = result.getPayload("savedOrder", Order.class);
            if (savedOrder == null) {
                throw new IllegalStateException("Saga execution failed: " + result.getFailureReason());
            }

            return mapToResponse(savedOrder, result.getSagaId());
        }

        private OrderDto.Response mapToResponse(Order order, String sagaId) {
            return OrderDto.Response.builder()
                    .orderId(order.getOrderId())
                    .userId(order.getUserId())
                    .tenantId(order.getTenantId())
                    .status(order.getStatus())
                    .totalAmount(order.getTotalAmount())
                    .paymentReference(order.getPaymentReference())
                    .sagaId(sagaId)
                    .createdAt(order.getCreatedAt())
                    .items(order.getItems().stream().map(i -> OrderDto.ItemResponse.builder()
                            .id(i.getId())
                            .sku(i.getSku())
                            .productName(i.getProductName())
                            .unitPrice(i.getUnitPrice())
                            .quantity(i.getQuantity())
                            .subtotal(i.getSubtotal())
                            .build()).collect(Collectors.toList()))
                    .build();
        }
    }
}
