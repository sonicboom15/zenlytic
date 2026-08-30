package com.zenlytic.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;

public class UserDto {

    public record CreateRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password,

            @NotBlank(message = "Full name is required")
            String fullName,

            String phoneNumber,
            Set<String> roles,
            Set<String> permissions,
            String status
    ) {}

    public record Response(
            String userId,
            String tenantId,
            String email,
            String fullName,
            String phoneNumber,
            String status,
            Set<String> roles,
            Set<String> permissions,
            Instant createdAt,
            Instant updatedAt
    ) {}
}

