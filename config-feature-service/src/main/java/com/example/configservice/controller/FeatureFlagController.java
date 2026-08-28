package com.example.configservice.controller;

import com.example.common.context.TenantContextHolder;
import com.example.common.logging.audit.Auditable;
import com.example.common.model.ApiResponse;
import com.example.configservice.dto.FeatureFlagDto;
import com.example.configservice.service.FeatureFlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feature-flags")
@Tag(name = "Feature Flags", description = "Dynamic feature gating and percentage canary rollout APIs")
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @PostMapping
    @Auditable(action = "UPDATE_FEATURE_FLAG", resource = "FEATURE_FLAG")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('config:write')")
    @Operation(summary = "Set or update dynamic feature flag status and rollout percentage")
    public ResponseEntity<ApiResponse<FeatureFlagDto.Response>> setFeatureFlag(@Valid @RequestBody FeatureFlagDto.Request request) {
        FeatureFlagDto.Response response = featureFlagService.setFeatureFlag(request);
        return ResponseEntity.ok(ApiResponse.ok("Feature flag saved", response));
    }

    @GetMapping("/{flagKey}")
    @Operation(summary = "Get feature flag status by key")
    public ResponseEntity<ApiResponse<FeatureFlagDto.Response>> getFeatureFlag(@PathVariable String flagKey) {
        FeatureFlagDto.Response response = featureFlagService.getFeatureFlag(flagKey);
        return ResponseEntity.ok(ApiResponse.ok("Feature flag retrieved", response));
    }

    @GetMapping("/{flagKey}/evaluate")
    @Operation(summary = "Evaluate feature flag for current tenant or specified tier")
    public ResponseEntity<ApiResponse<FeatureFlagDto.EvaluationResult>> evaluateFeatureFlag(
            @PathVariable String flagKey,
            @RequestParam(required = false) String tier) {
        String tenantId = TenantContextHolder.getTenantId();
        FeatureFlagDto.EvaluationResult result = featureFlagService.evaluateFlag(flagKey, tenantId, tier);
        return ResponseEntity.ok(ApiResponse.ok("Feature flag evaluated", result));
    }

    @GetMapping
    @Operation(summary = "List all feature flags for current tenant")
    public ResponseEntity<ApiResponse<List<FeatureFlagDto.Response>>> getAllFeatureFlags() {
        List<FeatureFlagDto.Response> response = featureFlagService.getAllFeatureFlags();
        return ResponseEntity.ok(ApiResponse.ok("Feature flags retrieved", response));
    }
}
