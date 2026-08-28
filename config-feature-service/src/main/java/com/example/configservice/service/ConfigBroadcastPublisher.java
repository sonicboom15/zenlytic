package com.example.configservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class ConfigBroadcastPublisher {

    private static final Logger log = LoggerFactory.getLogger(ConfigBroadcastPublisher.class);

    private final StringRedisTemplate redisTemplate;

    public ConfigBroadcastPublisher(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publishConfigChange(String tenantId, String configKey, String value) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String redisKey = "config:" + tenantId + ":" + configKey;
                redisTemplate.opsForValue().set(redisKey, value);
                redisTemplate.convertAndSend("config-events", "CONFIG_UPDATED:" + tenantId + ":" + configKey);
                log.info("Broadcasted Config Change to Redis topic 'config-events': {}", redisKey);
            }
        } catch (Exception ex) {
            log.warn("Failed to broadcast config change to Redis: {}", ex.getMessage());
        }
    }

    public void publishFeatureFlagChange(String tenantId, String flagKey, boolean enabled) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String redisKey = "feature:" + tenantId + ":" + flagKey;
                redisTemplate.opsForValue().set(redisKey, String.valueOf(enabled));
                redisTemplate.convertAndSend("feature-flag-events", "FEATURE_FLAG_UPDATED:" + tenantId + ":" + flagKey + ":" + enabled);
                log.info("Broadcasted Feature Flag to Redis topic 'feature-flag-events': {}", redisKey);
            }
        } catch (Exception ex) {
            log.warn("Failed to broadcast feature flag change to Redis: {}", ex.getMessage());
        }
    }
}
