package com.zenlytic.common.saga;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SagaContext {

    private String sagaId;
    private String sagaType;
    private String tenantId;
    private String userId;
    private SagaStatus status = SagaStatus.STARTED;
    private String currentStep;
    private String failureReason;
    private Map<String, Object> payload = new HashMap<>();
    private List<SagaStepLog> stepLogs = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant completedAt;

    public SagaContext() {}

    public SagaContext(String sagaId, String sagaType, String tenantId, String userId) {
        this.sagaId = sagaId;
        this.sagaType = sagaType;
        this.tenantId = tenantId;
        this.userId = userId;
    }

    public void addStepLog(SagaStepLog log) {
        this.stepLogs.add(log);
    }

    public void setPayload(String key, Object value) {
        this.payload.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <V> V getPayload(String key, Class<V> clazz) {
        Object val = this.payload.get(key);
        if (val == null) return null;
        if (clazz.isInstance(val)) {
            return (V) val;
        }
        return null;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public String getSagaType() { return sagaType; }
    public void setSagaType(String sagaType) { this.sagaType = sagaType; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public SagaStatus getStatus() { return status; }
    public void setStatus(SagaStatus status) { this.status = status; }

    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public List<SagaStepLog> getStepLogs() { return stepLogs; }
    public void setStepLogs(List<SagaStepLog> stepLogs) { this.stepLogs = stepLogs; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String sagaId;
        private String sagaType;
        private String tenantId;
        private String userId;

        public Builder sagaId(String sagaId) { this.sagaId = sagaId; return this; }
        public Builder sagaType(String sagaType) { this.sagaType = sagaType; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }

        public SagaContext build() {
            return new SagaContext(sagaId, sagaType, tenantId, userId);
        }
    }
}
