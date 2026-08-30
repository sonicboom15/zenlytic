package com.zenlytic.worker.scheduling;

import com.zenlytic.common.context.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TenantDailyAuditJob implements Runnable {

    private static final Logger log = LoggerFactory.getLogger(TenantDailyAuditJob.class);

    @Override
    public void run() {
        String tenantId = TenantContextHolder.getTenantId();
        log.info("Running daily compliance and transaction summary audit for tenant [{}]...", tenantId);
        // Simulation of daily batch settlement / aggregation
        log.info("Daily audit job completed successfully for tenant [{}]", tenantId);
    }
}
