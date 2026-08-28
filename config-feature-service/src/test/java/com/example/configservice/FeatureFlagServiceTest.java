package com.example.configservice;

import com.example.configservice.dto.FeatureFlagDto;
import com.example.configservice.entity.FeatureFlag;
import com.example.configservice.repository.FeatureFlagRepository;
import com.example.configservice.service.ConfigBroadcastPublisher;
import com.example.configservice.service.FeatureFlagService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FeatureFlagServiceTest {

    private FeatureFlagRepository flagRepository;
    private ConfigBroadcastPublisher broadcastPublisher;
    private FeatureFlagService featureFlagService;

    @BeforeEach
    void setUp() {
        flagRepository = mock(FeatureFlagRepository.class);
        broadcastPublisher = mock(ConfigBroadcastPublisher.class);
        featureFlagService = new FeatureFlagService(flagRepository, broadcastPublisher);
    }

    @Test
    @DisplayName("Should evaluate Tier-based feature flags properly")
    void testTierFeatureFlag() {
        FeatureFlag tierFlag = FeatureFlag.builder()
                .flagKey("ADVANCED_ANALYTICS")
                .enabled(true)
                .strategy("TIER")
                .targetTier("ENTERPRISE")
                .build();

        when(flagRepository.findByFlagKey("ADVANCED_ANALYTICS")).thenReturn(Optional.of(tierFlag));

        // Enterprise tenant: Enabled
        FeatureFlagDto.EvaluationResult enterpriseResult =
                featureFlagService.evaluateFlag("ADVANCED_ANALYTICS", "acme", "ENTERPRISE");
        assertTrue(enterpriseResult.enabled());

        // Starter tenant: Disabled
        FeatureFlagDto.EvaluationResult starterResult =
                featureFlagService.evaluateFlag("ADVANCED_ANALYTICS", "globex", "STARTER");
        assertFalse(starterResult.enabled());
    }

    @Test
    @DisplayName("Should evaluate Whitelist-based feature flags properly")
    void testWhitelistFeatureFlag() {
        FeatureFlag whitelistFlag = FeatureFlag.builder()
                .flagKey("BETA_DARK_MODE")
                .enabled(true)
                .strategy("WHITELIST")
                .targetTenants("acme,beta-corp")
                .build();

        when(flagRepository.findByFlagKey("BETA_DARK_MODE")).thenReturn(Optional.of(whitelistFlag));

        assertTrue(featureFlagService.evaluateFlag("BETA_DARK_MODE", "acme", "STARTER").enabled());
        assertTrue(featureFlagService.evaluateFlag("BETA_DARK_MODE", "beta-corp", "STARTER").enabled());
        assertFalse(featureFlagService.evaluateFlag("BETA_DARK_MODE", "other-corp", "STARTER").enabled());
    }
}
