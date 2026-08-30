package com.zenlytic.configservice.controller;

import com.zenlytic.common.logging.audit.Auditable;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.configservice.dto.ConfigDto;
import com.zenlytic.configservice.service.ConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/configs")
@Tag(name = "Dynamic Configurations", description = "Tenant-scoped dynamic configuration and secret management APIs")
public class ConfigurationController {

    private final ConfigurationService configurationService;

    public ConfigurationController(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @PostMapping
    @Auditable(action = "UPDATE_CONFIG", resource = "CONFIGURATION")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('config:write')")
    @Operation(summary = "Set or update dynamic configuration property")
    public ResponseEntity<ApiResponse<ConfigDto.Response>> setConfig(@Valid @RequestBody ConfigDto.Request request) {
        ConfigDto.Response response = configurationService.setConfig(request);
        return ResponseEntity.ok(ApiResponse.ok("Configuration property saved", response));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get dynamic configuration value by key")
    public ResponseEntity<ApiResponse<ConfigDto.Response>> getConfig(@PathVariable String key) {
        ConfigDto.Response response = configurationService.getConfig(key);
        return ResponseEntity.ok(ApiResponse.ok("Configuration property retrieved", response));
    }

    @GetMapping
    @Operation(summary = "List all configuration properties for current tenant")
    public ResponseEntity<ApiResponse<List<ConfigDto.Response>>> getAllConfigs() {
        List<ConfigDto.Response> response = configurationService.getAllConfigs();
        return ResponseEntity.ok(ApiResponse.ok("Configuration properties retrieved", response));
    }
}
