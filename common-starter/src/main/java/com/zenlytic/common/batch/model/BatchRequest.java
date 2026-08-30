package com.zenlytic.common.batch.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchRequest<T>(
        @NotEmpty(message = "Batch items list cannot be empty")
        @Valid
        List<T> items,
        boolean continueOnError,
        int chunkSize
) {
    public BatchRequest {
        if (chunkSize <= 0) {
            chunkSize = 50;
        }
    }

    public static <T> BatchRequest<T> of(List<T> items) {
        return new BatchRequest<>(items, true, 50);
    }

    public static <T> BatchRequest<T> of(List<T> items, boolean continueOnError) {
        return new BatchRequest<>(items, continueOnError, 50);
    }
}

