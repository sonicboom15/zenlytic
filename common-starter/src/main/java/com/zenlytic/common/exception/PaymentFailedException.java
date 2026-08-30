package com.zenlytic.common.exception;

import org.springframework.http.HttpStatus;

public class PaymentFailedException extends ApiException {
    public PaymentFailedException(String message) {
        super(message, HttpStatus.PAYMENT_REQUIRED);
    }
}
