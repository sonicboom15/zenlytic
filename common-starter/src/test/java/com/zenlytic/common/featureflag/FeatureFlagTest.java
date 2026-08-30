package com.zenlytic.common.featureflag;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeatureFlagTest {

    @Test
    @DisplayName("FeatureFlagEvaluator should support local overrides and tenant gating")
    void testFeatureEvaluation() {
        FeatureFlagEvaluator evaluator = new FeatureFlagEvaluator();

        // Default evaluation
        assertTrue(evaluator.isEnabled("ANALYTICS_V2", "tenant-acme"));

        // Override tenant-acme to false
        evaluator.setLocalOverride("ANALYTICS_V2", "tenant-acme", false);
        assertFalse(evaluator.isEnabled("ANALYTICS_V2", "tenant-acme"));

        // Other tenants remain true
        assertTrue(evaluator.isEnabled("ANALYTICS_V2", "tenant-globex"));
    }
}
