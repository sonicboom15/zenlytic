package com.example.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        boolean success,
        String error,
        String message,
        int status,
        String path,
        String correlationId,
        Instant timestamp,
        List<ValidationError> validationErrors
) {
    public record ValidationError(String field, String message) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = false;
        private String error;
        private String message;
        private int status;
        private String path;
        private String correlationId;
        private Instant timestamp = Instant.now();
        private List<ValidationError> validationErrors;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder error(String error) { this.error = error; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder status(int status) { this.status = status; return this; }
        public Builder path(String path) { this.path = path; return this; }
        public Builder correlationId(String correlationId) { this.correlationId = correlationId; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder validationErrors(List<ValidationError> validationErrors) { this.validationErrors = validationErrors; return this; }

        public ErrorResponse build() {
            return new ErrorResponse(success, error, message, status, path, correlationId, timestamp, validationErrors);
        }
    }
}
