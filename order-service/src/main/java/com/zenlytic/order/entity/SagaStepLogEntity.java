package com.zenlytic.order.entity;

import com.zenlytic.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "saga_step_logs")
public class SagaStepLogEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saga_instance_id_fk", nullable = false)
    @JsonIgnore
    private SagaInstanceEntity sagaInstance;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "status", nullable = false)
    private String status; // STARTED, COMPLETED, COMPENSATING, COMPENSATED, FAILED

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", length = 1024)
    private String errorMessage;

    @Column(name = "executed_at")
    private Instant executedAt = Instant.now();

    public SagaStepLogEntity() {}

    public SagaStepLogEntity(SagaInstanceEntity sagaInstance, String stepName, String status, Long durationMs, String errorMessage, Instant executedAt) {
        this.sagaInstance = sagaInstance;
        this.stepName = stepName;
        this.status = status;
        this.durationMs = durationMs;
        this.errorMessage = errorMessage;
        this.executedAt = executedAt != null ? executedAt : Instant.now();
    }

    public SagaInstanceEntity getSagaInstance() { return sagaInstance; }
    public void setSagaInstance(SagaInstanceEntity sagaInstance) { this.sagaInstance = sagaInstance; }

    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getExecutedAt() { return executedAt; }
    public void setExecutedAt(Instant executedAt) { this.executedAt = executedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private SagaInstanceEntity sagaInstance;
        private String stepName;
        private String status;
        private Long durationMs;
        private String errorMessage;
        private Instant executedAt = Instant.now();

        public Builder sagaInstance(SagaInstanceEntity sagaInstance) { this.sagaInstance = sagaInstance; return this; }
        public Builder stepName(String stepName) { this.stepName = stepName; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder durationMs(Long durationMs) { this.durationMs = durationMs; return this; }
        public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public Builder executedAt(Instant executedAt) { this.executedAt = executedAt; return this; }

        public SagaStepLogEntity build() {
            return new SagaStepLogEntity(sagaInstance, stepName, status, durationMs, errorMessage, executedAt);
        }
    }
}
