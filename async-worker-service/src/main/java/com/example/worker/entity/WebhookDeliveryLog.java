package com.example.worker.entity;

import com.example.common.entity.TenantAwareEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "webhook_delivery_logs")
public class WebhookDeliveryLog extends TenantAwareEntity {

    @Column(name = "event_id", nullable = false, length = 64)
    private String eventId;

    @Column(name = "webhook_url", nullable = false, length = 1024)
    private String webhookUrl;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "delivery_status", nullable = false, length = 32)
    private String deliveryStatus; // SUCCESS, FAILED, RETRYING

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 1;

    @Column(name = "response_body", length = 2048)
    private String responseBody;

    @Column(name = "delivered_at")
    private Instant deliveredAt = Instant.now();

    public WebhookDeliveryLog() {}

    public WebhookDeliveryLog(String eventId, String webhookUrl, Integer httpStatus, String deliveryStatus, Integer attemptCount, String responseBody, Instant deliveredAt) {
        this.eventId = eventId;
        this.webhookUrl = webhookUrl;
        this.httpStatus = httpStatus;
        this.deliveryStatus = deliveryStatus;
        this.attemptCount = attemptCount != null ? attemptCount : 1;
        this.responseBody = responseBody;
        this.deliveredAt = deliveredAt != null ? deliveredAt : Instant.now();
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }

    public Integer getHttpStatus() { return httpStatus; }
    public void setHttpStatus(Integer httpStatus) { this.httpStatus = httpStatus; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }

    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String eventId;
        private String webhookUrl;
        private Integer httpStatus;
        private String deliveryStatus;
        private Integer attemptCount = 1;
        private String responseBody;
        private Instant deliveredAt = Instant.now();
        private String tenantId;

        public Builder eventId(String eventId) { this.eventId = eventId; return this; }
        public Builder webhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; return this; }
        public Builder httpStatus(Integer httpStatus) { this.httpStatus = httpStatus; return this; }
        public Builder deliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; return this; }
        public Builder attemptCount(Integer attemptCount) { this.attemptCount = attemptCount; return this; }
        public Builder responseBody(String responseBody) { this.responseBody = responseBody; return this; }
        public Builder deliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }

        public WebhookDeliveryLog build() {
            WebhookDeliveryLog log = new WebhookDeliveryLog(eventId, webhookUrl, httpStatus, deliveryStatus, attemptCount, responseBody, deliveredAt);
            if (tenantId != null) {
                log.setTenantId(tenantId);
            }
            return log;
        }
    }
}
