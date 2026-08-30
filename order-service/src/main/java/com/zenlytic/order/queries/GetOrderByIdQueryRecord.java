package com.zenlytic.order.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.order.dto.OrderDto;
import com.zenlytic.order.entity.Order;
import com.zenlytic.order.repository.OrderRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

public class GetOrderByIdQueryRecord {

    public record Query(String orderId) implements com.zenlytic.common.cqrs.query.Query<OrderDto.Response> {}

    @Component
    public static class Handler implements QueryHandler<Query, OrderDto.Response> {

        private final OrderRepository orderRepository;

        public Handler(OrderRepository orderRepository) {
            this.orderRepository = orderRepository;
        }

        @Override
        @Cacheable(value = "orders", keyGenerator = "tenantKeyGenerator")
        public OrderDto.Response handle(Query query) {
            Order order = orderRepository.findByOrderId(query.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", query.orderId()));

            return OrderDto.Response.builder()
                    .orderId(order.getOrderId())
                    .userId(order.getUserId())
                    .tenantId(order.getTenantId())
                    .status(order.getStatus())
                    .totalAmount(order.getTotalAmount())
                    .paymentReference(order.getPaymentReference())
                    .customerId(order.getCustomerId())
                    .customerName(order.getCustomerName())
                    .discountPercentage(order.getDiscountPercentage())
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
