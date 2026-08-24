package com.example.common.saga;

public interface SagaStep<T> {

    default String getName() {
        return getStepName();
    }

    default String getStepName() {
        return getName();
    }

    default boolean execute(SagaContext context) {
        return true;
    }

    default void compensate(SagaContext context) {
    }

    default boolean execute(SagaContext context, T input) {
        return execute(context);
    }

    default void compensate(SagaContext context, T input) {
        compensate(context);
    }
}
