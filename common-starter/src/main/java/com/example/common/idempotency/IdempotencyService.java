package com.example.common.idempotency;

import com.example.common.context.TenantContextHolder;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;

    public IdempotencyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean lockKey(String idempotencyKey, long ttlSeconds) {
        String key = buildKey(idempotencyKey);
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING", Duration.ofSeconds(ttlSeconds));
        return Boolean.TRUE.equals(acquired);
    }

    public void storeResult(String idempotencyKey, String resultJson, long ttlSeconds) {
        String key = buildKey(idempotencyKey);
        redisTemplate.opsForValue().set(key, resultJson, Duration.ofSeconds(ttlSeconds));
    }

    public Optional<String> getResult(String idempotencyKey) {
        String key = buildKey(idempotencyKey);
        String val = redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(val);
    }

    public void releaseLock(String idempotencyKey) {
        String key = buildKey(idempotencyKey);
        redisTemplate.delete(key);
    }

    private String buildKey(String idempotencyKey) {
        String tenantId = TenantContextHolder.getTenantId();
        return "idempotency:" + (tenantId != null ? tenantId : "global") + ":" + idempotencyKey;
    }
}
