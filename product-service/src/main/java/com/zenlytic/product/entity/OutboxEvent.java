package com.zenlytic.product.entity;

import com.zenlytic.common.entity.TenantAwareEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent extends TenantAwareEntity {

    @Column(name = "event_id", nullable = false, unique = true, length = 64)
    private String eventId = UUID.randomUUID().toString();

    @Column(name = "event_type", nullable = false, length = 128)
    private String eventType;

    @Column(name = "aggregate_type", nullable = false, length = 64)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false, length = 64)
    private String aggregateId;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "PENDING"; // PENDING, PUBLISHED, FAILED

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "error_message")
    private String errorMessage;

    public OutboxEvent() {}

    public OutboxEvent(String eventId, String eventType, String aggregateType, String aggregateId, String payload, String status, Integer retryCount, String errorMessage) {
        this.eventId = eventId != null ? eventId : UUID.randomUUID().toString();
        this.eventType = eventType;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.status = status != null ? status : "PENDING";
        this.retryCount = retryCount != null ? retryCount : 0;
        this.errorMessage = errorMessage;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getAggregateType() { return aggregateType; }
    public void setAggregateType(String aggregateType) { this.aggregateType = aggregateType; }

    public String getAggregateId() { return aggregateId; }
    public void setAggregateId(String aggregateId) { this.aggregateId = aggregateId; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String eventId = UUID.randomUUID().toString();
        private String eventType;
        private String aggregateType;
        private String aggregateId;
        private String payload;
        private String status = "PENDING";
        private Integer retryCount = 0;
        private String errorMessage;

        public Builder eventId(String eventId) { this.eventId = eventId; return this; }
        public Builder eventType(String eventType) { this.eventType = eventType; return this; }
        public Builder aggregateType(String aggregateType) { this.aggregateType = aggregateType; return this; }
        public Builder aggregateId(String aggregateId) { this.aggregateId = aggregateId; return this; }
        public Builder payload(String payload) { this.payload = payload; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder retryCount(Integer retryCount) { this.retryCount = retryCount; return this; }
        public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }

        public OutboxEvent build() {
            return new OutboxEvent(eventId, eventType, aggregateType, aggregateId, payload, status, retryCount, errorMessage);
        }
    }
}
