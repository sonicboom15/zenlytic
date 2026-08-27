package com.example.order.entity;

import com.example.common.entity.TenantAwareEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saga_instances")
public class SagaInstanceEntity extends TenantAwareEntity {

    @Column(name = "saga_id", nullable = false, unique = true, length = 64)
    private String sagaId;

    @Column(name = "saga_type", nullable = false, length = 64)
    private String sagaType;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "STARTED"; // STARTED, COMPLETED, COMPENSATING, COMPENSATED, FAILED

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "failure_reason", length = 1024)
    private String failureReason;

    @OneToMany(mappedBy = "sagaInstance", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SagaStepLogEntity> stepLogs = new ArrayList<>();

    public SagaInstanceEntity() {}

    public SagaInstanceEntity(String sagaId, String sagaType, String status, String currentStep, String payload, String failureReason, List<SagaStepLogEntity> stepLogs) {
        this.sagaId = sagaId;
        this.sagaType = sagaType;
        this.status = status != null ? status : "STARTED";
        this.currentStep = currentStep;
        this.payload = payload;
        this.failureReason = failureReason;
        this.stepLogs = stepLogs != null ? stepLogs : new ArrayList<>();
    }

    public void addStepLog(SagaStepLogEntity stepLog) {
        stepLogs.add(stepLog);
        stepLog.setSagaInstance(this);
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public String getSagaType() { return sagaType; }
    public void setSagaType(String sagaType) { this.sagaType = sagaType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public List<SagaStepLogEntity> getStepLogs() { return stepLogs; }
    public void setStepLogs(List<SagaStepLogEntity> stepLogs) { this.stepLogs = stepLogs; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String sagaId;
        private String sagaType;
        private String status = "STARTED";
        private String currentStep;
        private String payload;
        private String failureReason;
        private List<SagaStepLogEntity> stepLogs = new ArrayList<>();

        public Builder sagaId(String sagaId) { this.sagaId = sagaId; return this; }
        public Builder sagaType(String sagaType) { this.sagaType = sagaType; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder currentStep(String currentStep) { this.currentStep = currentStep; return this; }
        public Builder payload(String payload) { this.payload = payload; return this; }
        public Builder failureReason(String failureReason) { this.failureReason = failureReason; return this; }
        public Builder stepLogs(List<SagaStepLogEntity> stepLogs) { this.stepLogs = stepLogs != null ? stepLogs : new ArrayList<>(); return this; }

        public SagaInstanceEntity build() {
            return new SagaInstanceEntity(sagaId, sagaType, status, currentStep, payload, failureReason, stepLogs);
        }
    }
}
