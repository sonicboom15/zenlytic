package com.zenlytic.common.batch.service;

import com.zenlytic.common.batch.model.BatchItemResult;
import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.concurrency.ParallelWorkExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

@Component
public class BatchProcessor {

    private static final Logger log = LoggerFactory.getLogger(BatchProcessor.class);
    private final ParallelWorkExecutor parallelWorkExecutor;

    public BatchProcessor(ParallelWorkExecutor parallelWorkExecutor) {
        this.parallelWorkExecutor = parallelWorkExecutor;
    }

    private record IndexedItem<T>(int index, T item) {}

    /**
     * Process items sequentially with item-level error handling.
     */
    public <T, R> BatchResponse<R> processSequential(
            BatchRequest<T> request,
            Function<T, String> keyExtractor,
            Function<T, R> itemProcessor
    ) {
        List<T> items = request.items();
        if (items == null || items.isEmpty()) {
            return new BatchResponse<>(0, 0, 0, Collections.emptyList());
        }

        List<BatchItemResult<R>> results = new ArrayList<>(items.size());

        for (int i = 0; i < items.size(); i++) {
            T item = items.get(i);
            String key = keyExtractor != null ? keyExtractor.apply(item) : String.valueOf(i);
            try {
                R result = itemProcessor.apply(item);
                results.add(BatchItemResult.success(i, key, result));
            } catch (Exception ex) {
                log.warn("Error processing batch item at index [{}], key [{}]: {}", i, key, ex.getMessage());
                results.add(BatchItemResult.failure(i, key, ex.getMessage(), ex.getClass().getSimpleName()));
                if (!request.continueOnError()) {
                    log.info("Batch halted at index [{}] because continueOnError is false", i);
                    break;
                }
            }
        }

        return BatchResponse.of(results);
    }

    /**
     * Process items in parallel using Virtual Threads with chunking.
     */
    public <T, R> BatchResponse<R> processParallel(
            BatchRequest<T> request,
            Function<T, String> keyExtractor,
            BiFunction<Integer, T, R> itemProcessor
    ) {
        List<T> items = request.items();
        if (items == null || items.isEmpty()) {
            return new BatchResponse<>(0, 0, 0, Collections.emptyList());
        }

        List<IndexedItem<T>> indexedItems = new ArrayList<>(items.size());
        for (int i = 0; i < items.size(); i++) {
            indexedItems.add(new IndexedItem<>(i, items.get(i)));
        }

        List<BatchItemResult<R>> results = parallelWorkExecutor.executeInParallel(
                indexedItems,
                indexed -> {
                    int index = indexed.index();
                    T item = indexed.item();
                    String key = keyExtractor != null ? keyExtractor.apply(item) : String.valueOf(index);
                    try {
                        R result = itemProcessor.apply(index, item);
                        return BatchItemResult.success(index, key, result);
                    } catch (Exception ex) {
                        log.warn("Parallel batch item failed [{}]: {}", key, ex.getMessage());
                        return BatchItemResult.failure(index, key, ex.getMessage(), ex.getClass().getSimpleName());
                    }
                }
        );

        return BatchResponse.of(results);
    }
}

