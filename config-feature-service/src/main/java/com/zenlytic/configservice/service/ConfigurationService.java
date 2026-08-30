package com.zenlytic.configservice.service;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.configservice.dto.ConfigDto;
import com.zenlytic.configservice.entity.ConfigEntry;
import com.zenlytic.configservice.repository.ConfigEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConfigurationService {

    private static final Logger log = LoggerFactory.getLogger(ConfigurationService.class);

    private final ConfigEntryRepository repository;
    private final ConfigBroadcastPublisher broadcastPublisher;

    public ConfigurationService(ConfigEntryRepository repository, ConfigBroadcastPublisher broadcastPublisher) {
        this.repository = repository;
        this.broadcastPublisher = broadcastPublisher;
    }

    @Transactional
    public ConfigDto.Response setConfig(ConfigDto.Request request) {
        String tenantId = TenantContextHolder.getTenantId();

        ConfigEntry entry = repository.findByConfigKey(request.configKey())
                .orElseGet(() -> {
                    ConfigEntry newEntry = ConfigEntry.builder()
                            .configKey(request.configKey())
                            .build();
                    newEntry.setTenantId(tenantId);
                    return newEntry;
                });

        entry.setConfigValue(request.configValue());
        entry.setServiceName(request.serviceName());
        entry.setDescription(request.description());
        entry.setIsSecret(request.isSecret());

        ConfigEntry saved = repository.save(entry);
        log.info("Saved configuration [{}] for tenant [{}]", saved.getConfigKey(), tenantId);

        // Broadcast to Redis
        broadcastPublisher.publishConfigChange(tenantId, saved.getConfigKey(), saved.getConfigValue());

        return mapToResponse(saved, "TENANT_OVERRIDE");
    }

    public ConfigDto.Response resolveConfig(String key, String tenantId, String serviceName) {
        // 1. Check tenant override
        if (tenantId != null) {
            Optional<ConfigEntry> tenantConfig = repository.findByConfigKeyAndTenantIdAndServiceName(key, tenantId, serviceName);
            if (tenantConfig.isPresent()) {
                return mapToResponse(tenantConfig.get(), "TENANT_OVERRIDE");
            }
        }

        // 2. Check global default
        Optional<ConfigEntry> globalConfig = repository.findByConfigKeyAndTenantIdAndServiceName(key, null, serviceName);
        if (globalConfig.isPresent()) {
            return mapToResponse(globalConfig.get(), "GLOBAL_DEFAULT");
        }

        // 3. Simple fallback
        ConfigEntry entry = repository.findByConfigKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("ConfigEntry", "key", key));
        return mapToResponse(entry, "GLOBAL_DEFAULT");
    }

    public ConfigDto.Response getConfig(String key) {
        String tenantId = TenantContextHolder.getTenantId();
        return resolveConfig(key, tenantId, null);
    }

    public List<ConfigDto.Response> getAllConfigs() {
        return repository.findAll().stream()
                .map(e -> mapToResponse(e, e.getTenantId() != null ? "TENANT_OVERRIDE" : "GLOBAL_DEFAULT"))
                .collect(Collectors.toList());
    }

    private ConfigDto.Response mapToResponse(ConfigEntry entry, String source) {
        return ConfigDto.Response.builder()
                .id(entry.getId())
                .configKey(entry.getConfigKey())
                .configValue(Boolean.TRUE.equals(entry.getIsSecret()) ? "******" : entry.getConfigValue())
                .serviceName(entry.getServiceName())
                .description(entry.getDescription())
                .isSecret(entry.getIsSecret())
                .tenantId(entry.getTenantId())
                .source(source)
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
