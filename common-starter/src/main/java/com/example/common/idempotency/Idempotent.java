package com.example.common.idempotency;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Idempotent {

    /**
     * Header name for extracting idempotency key.
     */
    String headerName() default "Idempotency-Key";

    /**
     * Key expression (e.g. "#request.idempotencyKey").
     */
    String key() default "";

    /**
     * Time to retain idempotency key lock / cached response (in seconds).
     */
    long ttlSeconds() default 300L;
}
