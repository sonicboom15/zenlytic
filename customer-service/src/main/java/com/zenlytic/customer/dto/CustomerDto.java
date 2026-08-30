package com.zenlytic.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.Instant;

public class CustomerDto {

    public record CreateRequest(
            @NotBlank(message = "Customer name is required")
            String name,

            @NotBlank(message = "Customer code is required")
            String code,

            String companyName,
            String email,
            String phone,
            String taxId,
            String billingAddress,
            String shippingAddress,

            @PositiveOrZero(message = "Credit limit must be positive or zero")
            BigDecimal creditLimit,

            @PositiveOrZero(message = "Max discount percentage must be positive or zero")
            BigDecimal maxDiscountPercentage,

            String tier,
            String status,
            String notes
    ) {}

    public record UpdateRequest(
            String name,
            String companyName,
            String email,
            String phone,
            String taxId,
            String billingAddress,
            String shippingAddress,
            BigDecimal creditLimit,
            BigDecimal currentBalance,
            BigDecimal maxDiscountPercentage,
            String tier,
            String status,
            String notes
    ) {}

    public record Response(
            String customerId,
            String tenantId,
            String name,
            String code,
            String companyName,
            String email,
            String phone,
            String taxId,
            String billingAddress,
            String shippingAddress,
            BigDecimal creditLimit,
            BigDecimal currentBalance,
            BigDecimal availableCredit,
            BigDecimal maxDiscountPercentage,
            String tier,
            String status,
            String notes,
            Instant createdAt,
            Instant updatedAt
    ) {}
}

