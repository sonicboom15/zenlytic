package com.example.common.cache;

import com.example.common.context.TenantContextHolder;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Component("tenantKeyGenerator")
public class TenantKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        String tenantId = TenantContextHolder.getTenantId();
        String paramsKey = Arrays.deepToString(params);
        return String.format("tenant:%s:%s", tenantId, paramsKey);
    }
}
