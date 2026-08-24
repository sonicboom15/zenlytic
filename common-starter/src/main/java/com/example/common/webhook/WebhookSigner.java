package com.example.common.webhook;

public final class WebhookSigner {

    private WebhookSigner() {}

    public static String generateSignature(String payloadJson, String secretKey) {
        return WebhookSignatureUtils.calculateSignature(payloadJson, secretKey);
    }

    public static String calculateSignature(String payloadJson, String secretKey) {
        return WebhookSignatureUtils.calculateSignature(payloadJson, secretKey);
    }

    public static boolean verifySignature(String payloadJson, String secretKey, String signature) {
        return WebhookSignatureUtils.verifySignature(payloadJson, secretKey, signature);
    }
}
