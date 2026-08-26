package com.example.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public class ProductDto {

    public record Request(
            @NotBlank(message = "SKU is required")
            String sku,

            @NotBlank(message = "Product name is required")
            String name,

            String description,

            @NotNull(message = "Price is required")
            @DecimalMin(value = "0.01", message = "Price must be greater than 0")
            BigDecimal price,

            @NotNull(message = "Stock quantity is required")
            @Min(value = 0, message = "Stock cannot be negative")
            Integer stockQuantity,

            String category
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String sku;
            private String name;
            private String description;
            private BigDecimal price;
            private Integer stockQuantity = 0;
            private String category;

            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder price(BigDecimal price) { this.price = price; return this; }
            public Builder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
            public Builder category(String category) { this.category = category; return this; }

            public Request build() {
                return new Request(sku, name, description, price, stockQuantity, category);
            }
        }
    }

    public record Response(
            Long id,
            String sku,
            String name,
            String description,
            BigDecimal price,
            Integer stockQuantity,
            Integer availableStock,
            String category,
            String tenantId,
            String status,
            Instant createdAt
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String sku;
            private String name;
            private String description;
            private BigDecimal price;
            private Integer stockQuantity;
            private Integer availableStock;
            private String category;
            private String tenantId;
            private String status;
            private Instant createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder price(BigDecimal price) { this.price = price; return this; }
            public Builder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
            public Builder availableStock(Integer availableStock) { this.availableStock = availableStock; return this; }
            public Builder category(String category) { this.category = category; return this; }
            public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

            public Response build() {
                return new Response(id, sku, name, description, price, stockQuantity, availableStock, category, tenantId, status, createdAt);
            }
        }
    }

    public record ReserveStockRequest(
            @NotBlank(message = "SKU is required")
            String sku,

            @NotNull(message = "Quantity is required")
            @Min(value = 1, message = "Quantity must be at least 1")
            Integer quantity,

            @NotBlank(message = "Order ID is required")
            String orderId
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String sku;
            private Integer quantity;
            private String orderId;

            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
            public Builder orderId(String orderId) { this.orderId = orderId; return this; }

            public ReserveStockRequest build() {
                return new ReserveStockRequest(sku, quantity, orderId);
            }
        }
    }

    public record ReserveStockResponse(
            boolean reserved,
            String sku,
            Integer quantityReserved,
            String message
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean reserved;
            private String sku;
            private Integer quantityReserved;
            private String message;

            public Builder reserved(boolean reserved) { this.reserved = reserved; return this; }
            public Builder sku(String sku) { this.sku = sku; return this; }
            public Builder quantityReserved(Integer quantityReserved) { this.quantityReserved = quantityReserved; return this; }
            public Builder message(String message) { this.message = message; return this; }

            public ReserveStockResponse build() {
                return new ReserveStockResponse(reserved, sku, quantityReserved, message);
            }
        }
    }
}
