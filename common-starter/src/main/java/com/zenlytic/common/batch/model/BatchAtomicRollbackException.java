package com.zenlytic.common.batch.model;

public class BatchAtomicRollbackException extends RuntimeException {

    private final BatchResponse<?> batchResponse;

    public BatchAtomicRollbackException(BatchResponse<?> batchResponse) {
        super("Batch transaction rolled back");
        this.batchResponse = batchResponse;
    }

    public BatchResponse<?> getBatchResponse() {
        return batchResponse;
    }
}

