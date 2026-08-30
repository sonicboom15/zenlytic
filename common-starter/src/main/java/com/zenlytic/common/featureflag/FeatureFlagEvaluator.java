package com.zenlytic.common.featureflag;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class FeatureFlagEvaluator {

    private static final Logger log = LoggerFactory.getLogger(FeatureFlagEvaluator.class);

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Boolean> localFlagCache = new ConcurrentHashMap<>();

    public FeatureFlagEvaluator() {
        this(null);
    }

    public FeatureFlagEvaluator(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isFeatureEnabled(String featureKey) {
        TenantContext tenant = TenantContextHolder.get();
        String tenantId = tenant != null ? tenant.tenantId() : "global";
        return isEnabled(featureKey, tenantId);
    }

    public boolean isEnabled(String featureKey, String tenantId) {
        String key = "feature:" + (tenantId != null ? tenantId : "global") + ":" + featureKey;
        if (localFlagCache.containsKey(key)) {
            return localFlagCache.get(key);
        }

        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String val = redisTemplate.opsForValue().get(key);
                if (val != null) {
                    boolean enabled = Boolean.parseBoolean(val);
                    localFlagCache.put(key, enabled);
                    return enabled;
                }
            }
        } catch (Exception ex) {
            log.warn("Redis unavailable for feature flag evaluation: {}", ex.getMessage());
        }

        return true;
    }

    public void setLocalOverride(String featureKey, String tenantId, boolean enabled) {
        localFlagCache.put("feature:" + (tenantId != null ? tenantId : "global") + ":" + featureKey, enabled);
    }

    public void setFeatureFlagLocally(String featureKey, String tenantId, boolean enabled) {
        setLocalOverride(featureKey, tenantId, enabled);
    }
}
