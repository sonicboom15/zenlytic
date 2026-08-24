package com.example.common.webhook;

import java.time.Instant;

public record WebhookPayload<T>(
        String webhookId,
        String eventType,
        String tenantId,
        Instant timestamp,
        T data
) {
    public String eventId() { return webhookId; }
    public String getEventId() { return webhookId; }
    public String getWebhookId() { return webhookId; }
    public String getEventType() { return eventType; }
    public String getTenantId() { return tenantId; }
    public Instant getTimestamp() { return timestamp; }
    public T getData() { return data; }

    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private String webhookId;
        private String eventType;
        private String tenantId;
        private Instant timestamp = Instant.now();
        private T data;

        public Builder<T> webhookId(String webhookId) { this.webhookId = webhookId; return this; }
        public Builder<T> eventId(String eventId) { this.webhookId = eventId; return this; }
        public Builder<T> eventType(String eventType) { this.eventType = eventType; return this; }
        public Builder<T> tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder<T> timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder<T> data(T data) { this.data = data; return this; }

        public WebhookPayload<T> build() {
            return new WebhookPayload<>(webhookId, eventType, tenantId, timestamp, data);
        }
    }
}
