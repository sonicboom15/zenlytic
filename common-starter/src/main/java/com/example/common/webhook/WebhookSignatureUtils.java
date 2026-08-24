package com.example.common.webhook;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class WebhookSignatureUtils {

    public static final String SIGNATURE_HEADER = "X-Signature-SHA256";
    private static final String HMAC_SHA256 = "HmacSHA256";

    private WebhookSignatureUtils() {
    }

    public static String calculateSignature(String payloadJson, String secretKey) {
        if (payloadJson == null || secretKey == null) {
            throw new IllegalArgumentException("Payload and secretKey cannot be null");
        }

        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payloadJson.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256 signature", e);
        }
    }

    public static boolean verifySignature(String payloadJson, String secretKey, String signature) {
        if (signature == null) {
            return false;
        }
        String calculated = calculateSignature(payloadJson, secretKey);
        return calculated.equalsIgnoreCase(signature);
    }
}
