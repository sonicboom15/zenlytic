package com.zenlytic.worker.controller;

import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.worker.scheduling.DynamicJobSchedulerService;
import com.zenlytic.worker.scheduling.TenantDailyAuditJob;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@Tag(name = "Job Scheduler", description = "Dynamic Cron job registration and cancellation APIs")
public class JobScheduleController {

    private final DynamicJobSchedulerService schedulerService;
    private final TenantDailyAuditJob dailyAuditJob;

    public JobScheduleController(DynamicJobSchedulerService schedulerService, TenantDailyAuditJob dailyAuditJob) {
        this.schedulerService = schedulerService;
        this.dailyAuditJob = dailyAuditJob;
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register dynamic tenant cron job")
    public ResponseEntity<ApiResponse<String>> scheduleJob(
            @RequestParam String jobKey,
            @RequestParam(defaultValue = "0 0 2 * * ?") String cron) {
        String tenantId = TenantContextHolder.getTenantId();
        schedulerService.registerJob(jobKey, cron, tenantId, dailyAuditJob);
        return ResponseEntity.ok(ApiResponse.ok("Job scheduled successfully", "Job " + jobKey + " scheduled with cron " + cron));
    }

    @DeleteMapping("/{jobKey}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancel a scheduled job by key")
    public ResponseEntity<ApiResponse<String>> cancelJob(@PathVariable String jobKey) {
        schedulerService.cancelJob(jobKey);
        return ResponseEntity.ok(ApiResponse.ok("Job cancelled successfully", "Job " + jobKey + " cancelled"));
    }
}
