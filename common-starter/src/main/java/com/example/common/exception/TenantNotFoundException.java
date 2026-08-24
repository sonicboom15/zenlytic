package com.example.common.exception;

import org.springframework.http.HttpStatus;

public class TenantNotFoundException extends ApiException {
    public TenantNotFoundException(String tenantId) {
        super(String.format("Tenant '%s' not found or inactive", tenantId), HttpStatus.NOT_FOUND);
    }
}
