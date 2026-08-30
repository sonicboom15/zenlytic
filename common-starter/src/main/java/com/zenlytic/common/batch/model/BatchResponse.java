package com.zenlytic.common.batch.model;

import java.util.List;

public record BatchResponse<R>(
        int totalRequested,
        int successCount,
        int failureCount,
        List<BatchItemResult<R>> results
) {
    public static <R> BatchResponse<R> of(List<BatchItemResult<R>> results) {
        int success = (int) results.stream().filter(BatchItemResult::success).count();
        int failure = results.size() - success;
        return new BatchResponse<>(results.size(), success, failure, results);
    }
}

