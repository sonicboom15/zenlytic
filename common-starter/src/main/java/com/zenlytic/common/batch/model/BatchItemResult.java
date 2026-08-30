package com.zenlytic.common.batch.model;

public record BatchItemResult<R>(
        int index,
        String keyIdentifier,
        boolean success,
        R data,
        String errorMessage,
        String errorCode
) {
    public static <R> BatchItemResult<R> success(int index, String keyIdentifier, R data) {
        return new BatchItemResult<>(index, keyIdentifier, true, data, null, null);
    }

    public static <R> BatchItemResult<R> failure(int index, String keyIdentifier, String errorMessage, String errorCode) {
        return new BatchItemResult<>(index, keyIdentifier, false, null, errorMessage, errorCode);
    }
}

