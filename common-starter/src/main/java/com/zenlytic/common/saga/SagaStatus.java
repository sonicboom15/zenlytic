package com.zenlytic.common.saga;

public enum SagaStatus {
    STARTED,
    RUNNING,
    COMPLETED,
    COMPENSATING,
    COMPENSATED,
    FAILED
}
