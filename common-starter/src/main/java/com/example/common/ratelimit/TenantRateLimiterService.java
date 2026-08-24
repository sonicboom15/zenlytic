package com.example.common.ratelimit;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TenantRateLimiterService {

    private final RateLimiterRegistry registry;
    private final ConcurrentHashMap<String, RateLimiter> tenantLimiters = new ConcurrentHashMap<>();

    public TenantRateLimiterService() {
        RateLimiterConfig defaultConfig = RateLimiterConfig.custom()
                .limitForPeriod(100)
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .timeoutDuration(Duration.ofMillis(50))
                .build();
        this.registry = RateLimiterRegistry.of(defaultConfig);
    }

    public RateLimiter getRateLimiterForTenant(String tenantId, String tier) {
        String key = (tenantId != null ? tenantId : "default") + ":" + (tier != null ? tier : "STARTER");
        return tenantLimiters.computeIfAbsent(key, k -> {
            int rps = switch ((tier != null ? tier : "STARTER").toUpperCase()) {
                case "ENTERPRISE" -> 1000;
                case "GROWTH" -> 300;
                default -> 50;
            };

            RateLimiterConfig config = RateLimiterConfig.custom()
                    .limitForPeriod(rps)
                    .limitRefreshPeriod(Duration.ofSeconds(1))
                    .timeoutDuration(Duration.ofMillis(20))
                    .build();

            return registry.rateLimiter(key, config);
        });
    }

    public boolean tryAcquirePermission(String tenantId, String tier) {
        RateLimiter limiter = getRateLimiterForTenant(tenantId, tier);
        return limiter.acquirePermission();
    }
}
