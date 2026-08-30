package com.zenlytic.common.logging.audit;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContextHolder;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        long start = System.currentTimeMillis();
        String status = "SUCCESS";
        Throwable error = null;

        try {
            return joinPoint.proceed();
        } catch (Throwable t) {
            status = "FAILURE";
            error = t;
            throw t;
        } finally {
            long duration = System.currentTimeMillis() - start;
            AuditEvent event = AuditEvent.builder()
                    .action(auditable.action())
                    .resource(auditable.resource())
                    .tenantId(TenantContextHolder.getTenantId())
                    .userId(UserContextHolder.getUserId())
                    .status(status)
                    .executionDurationMs(duration)
                    .timestamp(Instant.now())
                    .details(error != null ? Map.of("error", error.getMessage()) : Map.of())
                    .build();

            log.info("SECURITY_AUDIT: action='{}' resource='{}' tenant='{}' user='{}' status='{}' durationMs={}",
                    event.action(), event.resource(), event.tenantId(), event.userId(), event.status(), event.executionDurationMs());
        }
    }
}
