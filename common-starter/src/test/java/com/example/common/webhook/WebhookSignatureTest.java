package com.example.common.webhook;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WebhookSignatureTest {

    @Test
    @DisplayName("WebhookSignatureUtils should calculate and verify HMAC-SHA256 signatures")
    void testSignatureCalculationAndVerification() {
        String payloadJson = "{\"orderId\": \"ord-123\", \"amount\": 99.99}";
        String secretKey = "superSecretTenantWebhookKey";

        String signature = WebhookSignatureUtils.calculateSignature(payloadJson, secretKey);
        assertNotNull(signature);
        assertFalse(signature.isBlank());

        assertTrue(WebhookSignatureUtils.verifySignature(payloadJson, secretKey, signature));
        assertFalse(WebhookSignatureUtils.verifySignature(payloadJson, "wrongKey", signature));
        assertFalse(WebhookSignatureUtils.verifySignature("{\"tampered\": true}", secretKey, signature));
    }
}
