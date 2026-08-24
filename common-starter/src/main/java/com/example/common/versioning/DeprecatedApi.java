package com.example.common.versioning;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DeprecatedApi {

    /**
     * ISO-8601 date string or descriptive date when this API version will sunset (e.g. "2026-12-31")
     */
    String sunsetDate() default "";

    /**
     * Unix timestamp for Deprecation header (seconds since epoch)
     */
    long deprecationTimestamp() default 0;

    /**
     * Recommended successor endpoint URI (e.g. "/api/v2/products")
     */
    String successor() default "";

    /**
     * Optional custom deprecation warning message
     */
    String message() default "This API version is deprecated and will sunset soon. Please migrate to the successor version.";
}
