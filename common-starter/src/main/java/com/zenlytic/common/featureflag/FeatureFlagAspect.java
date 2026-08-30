package com.zenlytic.common.featureflag;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.exception.FeatureDisabledException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class FeatureFlagAspect {

    private final FeatureFlagEvaluator featureFlagEvaluator;

    public FeatureFlagAspect(FeatureFlagEvaluator featureFlagEvaluator) {
        this.featureFlagEvaluator = featureFlagEvaluator;
    }

    @Around("@annotation(requiresFeature)")
    public Object checkFeature(ProceedingJoinPoint joinPoint, RequiresFeature requiresFeature) throws Throwable {
        String featureKey = requiresFeature.value();
        if (!featureFlagEvaluator.isFeatureEnabled(featureKey)) {
            String tenantId = TenantContextHolder.getTenantId();
            throw new FeatureDisabledException(featureKey, tenantId);
        }
        return joinPoint.proceed();
    }
}
