package com.example.common.idempotency;

import com.example.common.exception.ConflictException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Type;
import java.util.Optional;

@Aspect
@Component
public class IdempotencyAspect {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyAspect.class);

    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public IdempotencyAspect(IdempotencyService idempotencyService, ObjectMapper objectMapper) {
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(idempotent)")
    public Object handleIdempotency(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return joinPoint.proceed();
        }

        HttpServletRequest request = attributes.getRequest();
        String idempotencyKey = request.getHeader(idempotent.headerName());

        if (!StringUtils.hasText(idempotencyKey)) {
            return joinPoint.proceed();
        }

        log.debug("Checking idempotency key: {}", idempotencyKey);
        Optional<String> cachedResult = idempotencyService.getResult(idempotencyKey);
        if (cachedResult.isPresent()) {
            String cached = cachedResult.get();
            if ("PROCESSING".equals(cached)) {
                throw new ConflictException("Concurrent request in progress with idempotency key: " + idempotencyKey);
            }
            log.info("Returning cached response for idempotency key: {}", idempotencyKey);
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Type returnType = signature.getMethod().getGenericReturnType();
            return objectMapper.readValue(cached, objectMapper.constructType(returnType));
        }

        boolean acquired = idempotencyService.lockKey(idempotencyKey, idempotent.ttlSeconds());
        if (!acquired) {
            throw new ConflictException("Concurrent request in progress for idempotency key: " + idempotencyKey);
        }

        Object result;
        try {
            result = joinPoint.proceed();
            String resultJson = objectMapper.writeValueAsString(result);
            idempotencyService.storeResult(idempotencyKey, resultJson, idempotent.ttlSeconds());
        } catch (Throwable t) {
            idempotencyService.releaseLock(idempotencyKey);
            throw t;
        }

        return result;
    }
}
