package com.example.configservice.service;

import com.example.common.context.TenantContextHolder;
import com.example.common.exception.ResourceNotFoundException;
import com.example.configservice.dto.FeatureFlagDto;
import com.example.configservice.entity.FeatureFlag;
import com.example.configservice.repository.FeatureFlagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeatureFlagService {

    private static final Logger log = LoggerFactory.getLogger(FeatureFlagService.class);

    private final FeatureFlagRepository repository;
    private final ConfigBroadcastPublisher broadcastPublisher;

    public FeatureFlagService(FeatureFlagRepository repository, ConfigBroadcastPublisher broadcastPublisher) {
        this.repository = repository;
        this.broadcastPublisher = broadcastPublisher;
    }

    @Transactional
    public FeatureFlagDto.Response setFeatureFlag(FeatureFlagDto.Request request) {
        String tenantId = TenantContextHolder.getTenantId();

        FeatureFlag flag = repository.findByFlagKey(request.flagKey())
                .orElseGet(() -> {
                    FeatureFlag newFlag = FeatureFlag.builder()
                            .flagKey(request.flagKey())
                            .build();
                    newFlag.setTenantId(tenantId);
                    return newFlag;
                });

        flag.setEnabled(request.enabled());
        flag.setStrategy(request.strategy() != null ? request.strategy() : "GLOBAL");
        flag.setTargetTier(request.targetTier());
        flag.setTargetTenants(request.targetTenants());
        flag.setDescription(request.description());
        flag.setRolloutPercentage(request.rolloutPercentage() != null ? request.rolloutPercentage() : 100);

        FeatureFlag saved = repository.save(flag);
        log.info("Updated feature flag [{}] -> enabled={} for tenant [{}]", saved.getFlagKey(), saved.getEnabled(), tenantId);

        // Broadcast to Redis
        broadcastPublisher.publishFeatureFlagChange(tenantId, saved.getFlagKey(), saved.getEnabled());

        return mapToResponse(saved);
    }

    public FeatureFlagDto.EvaluationResult evaluateFlag(String flagKey, String tenantId, String tier) {
        FeatureFlag flag = repository.findByFlagKey(flagKey)
                .orElse(null);

        if (flag == null) {
            return new FeatureFlagDto.EvaluationResult(true, flagKey, "Flag not found, default enabled");
        }

        if (!Boolean.TRUE.equals(flag.getEnabled())) {
            return new FeatureFlagDto.EvaluationResult(false, flagKey, "Flag globally disabled");
        }

        String strategy = flag.getStrategy() != null ? flag.getStrategy() : "GLOBAL";
        switch (strategy.toUpperCase()) {
            case "TIER":
                if (flag.getTargetTier() != null && tier != null) {
                    boolean matches = flag.getTargetTier().equalsIgnoreCase(tier);
                    return new FeatureFlagDto.EvaluationResult(matches, flagKey, "Tier evaluation: " + tier);
                }
                break;

            case "WHITELIST":
                if (flag.getTargetTenants() != null && tenantId != null) {
                    List<String> allowed = Arrays.stream(flag.getTargetTenants().split(","))
                            .map(String::trim)
                            .toList();
                    boolean allowedTenant = allowed.contains(tenantId);
                    return new FeatureFlagDto.EvaluationResult(allowedTenant, flagKey, "Whitelist evaluation: " + tenantId);
                }
                break;

            case "PERCENTAGE":
                int hash = Math.abs((tenantId != null ? tenantId : "global").hashCode()) % 100;
                boolean enabled = hash < (flag.getRolloutPercentage() != null ? flag.getRolloutPercentage() : 100);
                return new FeatureFlagDto.EvaluationResult(enabled, flagKey, "Percentage rollout: " + hash + "%");

            default:
                return new FeatureFlagDto.EvaluationResult(true, flagKey, "Global enabled");
        }

        return new FeatureFlagDto.EvaluationResult(false, flagKey, "Evaluation criteria not met");
    }

    public FeatureFlagDto.Response getFeatureFlag(String flagKey) {
        FeatureFlag flag = repository.findByFlagKey(flagKey)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureFlag", "flagKey", flagKey));
        return mapToResponse(flag);
    }

    public List<FeatureFlagDto.Response> getAllFeatureFlags() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FeatureFlagDto.Response mapToResponse(FeatureFlag flag) {
        return FeatureFlagDto.Response.builder()
                .id(flag.getId())
                .flagKey(flag.getFlagKey())
                .enabled(flag.getEnabled())
                .strategy(flag.getStrategy())
                .targetTier(flag.getTargetTier())
                .targetTenants(flag.getTargetTenants())
                .description(flag.getDescription())
                .rolloutPercentage(flag.getRolloutPercentage())
                .tenantId(flag.getTenantId())
                .createdAt(flag.getCreatedAt())
                .build();
    }
}
