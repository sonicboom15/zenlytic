package com.example.order.dto;

import java.time.Instant;
import java.util.List;

public record SagaTimelineResponseDto(
        String sagaId,
        String sagaType,
        String tenantId,
        String status,
        String currentStep,
        String failureReason,
        List<StepLogDto> steps,
        Instant createdAt
) {
    public record StepLogDto(
            String stepName,
            String status,
            Long durationMs,
            String errorMessage,
            Instant executedAt
    ) {
        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String stepName;
            private String status;
            private Long durationMs;
            private String errorMessage;
            private Instant executedAt = Instant.now();

            public Builder stepName(String stepName) { this.stepName = stepName; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder durationMs(Long durationMs) { this.durationMs = durationMs; return this; }
            public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
            public Builder executedAt(Instant executedAt) { this.executedAt = executedAt; return this; }

            public StepLogDto build() {
                return new StepLogDto(stepName, status, durationMs, errorMessage, executedAt);
            }
        }
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String sagaId;
        private String sagaType;
        private String tenantId;
        private String status;
        private String currentStep;
        private String failureReason;
        private List<StepLogDto> steps;
        private Instant createdAt;

        public Builder sagaId(String sagaId) { this.sagaId = sagaId; return this; }
        public Builder sagaType(String sagaType) { this.sagaType = sagaType; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder currentStep(String currentStep) { this.currentStep = currentStep; return this; }
        public Builder failureReason(String failureReason) { this.failureReason = failureReason; return this; }
        public Builder steps(List<StepLogDto> steps) { this.steps = steps; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public SagaTimelineResponseDto build() {
            return new SagaTimelineResponseDto(sagaId, sagaType, tenantId, status, currentStep, failureReason, steps, createdAt);
        }
    }
}
