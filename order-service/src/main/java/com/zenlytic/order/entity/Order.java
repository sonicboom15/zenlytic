package com.zenlytic.order.entity;

import com.zenlytic.common.entity.TenantAwareEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends TenantAwareEntity {

    @Column(name = "order_id", nullable = false, unique = true, length = 64)
    private String orderId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED, FAILED

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Order(String orderId, String userId, String status, BigDecimal totalAmount, String paymentReference, String idempotencyKey, List<OrderItem> items) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status != null ? status : "PENDING";
        this.totalAmount = totalAmount;
        this.paymentReference = paymentReference;
        this.idempotencyKey = idempotencyKey;
        this.items = items != null ? items : new ArrayList<>();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String orderId;
        private String userId;
        private String status = "PENDING";
        private BigDecimal totalAmount;
        private String paymentReference;
        private String idempotencyKey;
        private List<OrderItem> items = new ArrayList<>();

        public Builder orderId(String orderId) { this.orderId = orderId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder paymentReference(String paymentReference) { this.paymentReference = paymentReference; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder items(List<OrderItem> items) { this.items = items != null ? items : new ArrayList<>(); return this; }

        public Order build() {
            return new Order(orderId, userId, status, totalAmount, paymentReference, idempotencyKey, items);
        }
    }
}
