package com.zenlytic.common.cache;

import com.zenlytic.common.context.TenantContextHolder;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TenantCacheService {

    private final CacheManager cacheManager;

    public TenantCacheService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    public <T> Optional<T> get(String cacheName, String key, Class<T> type) {
        String tenantKey = getTenantKey(key);
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            return Optional.ofNullable(cache.get(tenantKey, type));
        }
        return Optional.empty();
    }

    public void put(String cacheName, String key, Object value) {
        String tenantKey = getTenantKey(key);
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.put(tenantKey, value);
        }
    }

    public void evict(String cacheName, String key) {
        String tenantKey = getTenantKey(key);
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(tenantKey);
        }
    }

    private String getTenantKey(String key) {
        String tenantId = TenantContextHolder.getTenantId();
        return (tenantId != null ? tenantId : "global") + ":" + key;
    }
}
