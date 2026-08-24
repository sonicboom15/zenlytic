package com.example.common.exception;

import org.springframework.http.HttpStatus;

public class FeatureDisabledException extends ApiException {
    public FeatureDisabledException(String featureKey, String tenantId) {
        super(String.format("Feature '%s' is not enabled or entitled for tenant '%s'", featureKey, tenantId), HttpStatus.FORBIDDEN);
    }
}
