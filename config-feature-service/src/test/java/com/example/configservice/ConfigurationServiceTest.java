package com.example.configservice;

import com.example.configservice.dto.ConfigDto;
import com.example.configservice.entity.ConfigEntry;
import com.example.configservice.repository.ConfigEntryRepository;
import com.example.configservice.service.ConfigBroadcastPublisher;
import com.example.configservice.service.ConfigurationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ConfigurationServiceTest {

    private ConfigEntryRepository configRepository;
    private ConfigBroadcastPublisher broadcastPublisher;
    private ConfigurationService configurationService;

    @BeforeEach
    void setUp() {
        configRepository = mock(ConfigEntryRepository.class);
        broadcastPublisher = mock(ConfigBroadcastPublisher.class);
        configurationService = new ConfigurationService(configRepository, broadcastPublisher);
    }

    @Test
    @DisplayName("Should resolve tenant override when present")
    void testResolveTenantOverride() {
        ConfigEntry tenantOverride = ConfigEntry.builder()
                .configKey("max.upload.mb")
                .configValue("500")
                .tenantId("acme")
                .build();

        when(configRepository.findByConfigKeyAndTenantIdAndServiceName("max.upload.mb", "acme", null))
                .thenReturn(Optional.of(tenantOverride));

        ConfigDto.Response response = configurationService.resolveConfig("max.upload.mb", "acme", null);

        assertEquals("500", response.getConfigValue());
        assertEquals("TENANT_OVERRIDE", response.getSource());
    }

    @Test
    @DisplayName("Should fall back to global default when tenant override is not present")
    void testResolveGlobalDefault() {
        ConfigEntry globalDefault = ConfigEntry.builder()
                .configKey("max.upload.mb")
                .configValue("50")
                .tenantId(null)
                .build();

        when(configRepository.findByConfigKeyAndTenantIdAndServiceName("max.upload.mb", "globex", null))
                .thenReturn(Optional.empty());
        when(configRepository.findByConfigKeyAndTenantIdAndServiceName("max.upload.mb", null, null))
                .thenReturn(Optional.of(globalDefault));

        ConfigDto.Response response = configurationService.resolveConfig("max.upload.mb", "globex", null);

        assertEquals("50", response.getConfigValue());
        assertEquals("GLOBAL_DEFAULT", response.getSource());
    }
}
