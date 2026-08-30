package com.zenlytic.common.logging;

import com.zenlytic.common.logging.masking.DataMaskingPatternLayout;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DataMaskingTest {

    @Test
    @DisplayName("DataMaskingPatternLayout should mask sensitive credentials and bearer tokens")
    void testMasking() {
        String logLine = "User registration payload: {\"username\": \"john\", \"password\": \"secret1234\", \"token\": \"jwt-abc-xyz\"} Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.xyz";

        String masked = DataMaskingPatternLayout.maskMessage(logLine);

        assertFalse(masked.contains("secret1234"));
        assertFalse(masked.contains("jwt-abc-xyz"));
        assertFalse(masked.contains("eyJhbGciOiJIUzI1NiJ9.xyz"));
        assertTrue(masked.contains("password=\"***\""));
        assertTrue(masked.contains("Bearer ***"));
    }
}
