package com.zenlytic.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDto {

    public record ItemRequest(
            @NotBlank(message = "SKU is required")
            String sku,

            @NotBlank(message = "Product name is required")
            String productName,

            @NotNull(message = "Unit price is required")
            @DecimalMin("0.01")
            BigDecimal unitPrice,

            @NotNull(message = "Quantity is required")
            @Min(1)
            Integer quantity
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String sku;
            private String productName;
            private BigDecimal unitPrice;
            private Integer quantity;

            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder productName(String productName) { this.productName = productName; return this; }
            public Builder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
            public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }

            public ItemRequest build() {
                return new ItemRequest(sku, productName, unitPrice, quantity);
            }
        }
    }

    public record ItemResponse(
            Long id,
            String sku,
            String productName,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String sku;
            private String productName;
            private BigDecimal unitPrice;
            private Integer quantity;
            private BigDecimal subtotal;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder productName(String productName) { this.productName = productName; return this; }
            public Builder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
            public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
            public Builder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

            public ItemResponse build() {
                return new ItemResponse(id, sku, productName, unitPrice, quantity, subtotal);
            }
        }
    }

    public record CreateRequest(
            @NotEmpty(message = "Order must contain at least one item")
            @Valid
            List<ItemRequest> items,

            String idempotencyKey,
            String customerId,
            String customerName,
            BigDecimal discountPercentage
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private List<ItemRequest> items;
            private String idempotencyKey;
            private String customerId;
            private String customerName;
            private BigDecimal discountPercentage = BigDecimal.ZERO;

            public Builder items(List<ItemRequest> items) { this.items = items; return this; }
            public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
            public Builder customerId(String customerId) { this.customerId = customerId; return this; }
            public Builder customerName(String customerName) { this.customerName = customerName; return this; }
            public Builder discountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; return this; }

            public CreateRequest build() {
                return new CreateRequest(items, idempotencyKey, customerId, customerName, discountPercentage);
            }
        }
    }

    public record Response(
            String orderId,
            String userId,
            String tenantId,
            String status,
            BigDecimal totalAmount,
            String paymentReference,
            String sagaId,
            String customerId,
            String customerName,
            BigDecimal discountPercentage,
            List<ItemResponse> items,
            Instant createdAt
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String orderId;
            private String userId;
            private String tenantId;
            private String status;
            private BigDecimal totalAmount;
            private String paymentReference;
            private String sagaId;
            private String customerId;
            private String customerName;
            private BigDecimal discountPercentage = BigDecimal.ZERO;
            private List<ItemResponse> items;
            private Instant createdAt;

            public Builder orderId(String orderId) { this.orderId = orderId; return this; }
            public Builder userId(String userId) { this.userId = userId; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
            public Builder paymentReference(String paymentReference) { this.paymentReference = paymentReference; return this; }
            public Builder sagaId(String sagaId) { this.sagaId = sagaId; return this; }
            public Builder customerId(String customerId) { this.customerId = customerId; return this; }
            public Builder customerName(String customerName) { this.customerName = customerName; return this; }
            public Builder discountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; return this; }
            public Builder items(List<ItemResponse> items) { this.items = items; return this; }
            public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

            public Response build() {
                return new Response(orderId, userId, tenantId, status, totalAmount, paymentReference, sagaId, customerId, customerName, discountPercentage, items, createdAt);
            }
        }
    }
}
