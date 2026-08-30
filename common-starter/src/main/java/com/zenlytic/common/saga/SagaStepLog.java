package com.zenlytic.common.saga;

import java.time.Instant;

public record SagaStepLog(
        String stepName,
        String status, // SUCCESS, FAILED, COMPENSATED
        String errorMessage,
        long executionDurationMs,
        Instant timestamp
) {
    public long durationMs() { return executionDurationMs; }
    public Instant executedAt() { return timestamp; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String stepName;
        private String status;
        private String errorMessage;
        private long executionDurationMs;
        private Instant timestamp = Instant.now();

        public Builder stepName(String stepName) { this.stepName = stepName; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public Builder executionDurationMs(long executionDurationMs) { this.executionDurationMs = executionDurationMs; return this; }
        public Builder durationMs(long durationMs) { this.executionDurationMs = durationMs; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder executedAt(Instant executedAt) { this.timestamp = executedAt; return this; }

        public SagaStepLog build() {
            return new SagaStepLog(stepName, status, errorMessage, executionDurationMs, timestamp);
        }
    }
}
