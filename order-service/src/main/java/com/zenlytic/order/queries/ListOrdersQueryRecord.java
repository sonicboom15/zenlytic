package com.zenlytic.order.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.model.PagedResponse;
import com.zenlytic.order.dto.OrderDto;
import com.zenlytic.order.entity.Order;
import com.zenlytic.order.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public final class ListOrdersQueryRecord {

    public record Query(String status, String customerId, String search, int page, int size) implements com.zenlytic.common.cqrs.query.Query<PagedResponse<OrderDto.Response>> {}

    @Component
    public static class Handler implements QueryHandler<Query, PagedResponse<OrderDto.Response>> {

        private final OrderRepository orderRepository;

        public Handler(OrderRepository orderRepository) {
            this.orderRepository = orderRepository;
        }

        @Override
        @Transactional(readOnly = true)
        public PagedResponse<OrderDto.Response> handle(Query query) {
            Pageable pageable = PageRequest.of(query.page(), query.size(), Sort.by(Sort.Direction.DESC, "createdAt"));

            String status = (query.status() != null && !query.status().isBlank()) ? query.status().trim() : null;
            String customerId = (query.customerId() != null && !query.customerId().isBlank()) ? query.customerId().trim() : null;
            String search = (query.search() != null && !query.search().isBlank()) ? "%" + query.search().trim().toLowerCase() + "%" : null;

            Page<Order> pageResult;
            if (status == null && customerId == null && search == null) {
                pageResult = orderRepository.findAll(pageable);
            } else {
                pageResult = orderRepository.searchOrders(status, customerId, search, pageable);
            }

            List<OrderDto.Response> items = pageResult.getContent().stream()
                    .map(order -> OrderDto.Response.builder()
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
                                    .build()).toList())
                            .build())
                    .toList();

            return new PagedResponse<>(
                    items,
                    pageResult.getNumber(),
                    pageResult.getSize(),
                    pageResult.getTotalElements(),
                    pageResult.getTotalPages(),
                    pageResult.isLast(),
                    pageResult.isFirst()
            );
        }
    }
}
