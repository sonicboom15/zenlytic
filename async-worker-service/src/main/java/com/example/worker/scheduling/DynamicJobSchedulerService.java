package com.example.worker.scheduling;

import com.example.common.context.TenantContext;
import com.example.common.context.TenantContextHolder;
import com.example.worker.entity.ScheduledJobDefinition;
import com.example.worker.repository.ScheduledJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
public class DynamicJobSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(DynamicJobSchedulerService.class);

    private final TaskScheduler taskScheduler;
    private final ScheduledJobRepository jobRepository;
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public DynamicJobSchedulerService(TaskScheduler taskScheduler, ScheduledJobRepository jobRepository) {
        this.taskScheduler = taskScheduler;
        this.jobRepository = jobRepository;
    }

    public String scheduleAtTime(String jobType, String tenantId, Instant runTime, String payloadJson) {
        String jobId = "JOB-" + UUID.randomUUID().toString().substring(0, 8);

        ScheduledJobDefinition def = ScheduledJobDefinition.builder()
                .jobKey(jobId)
                .jobType(jobType)
                .cronExpression(runTime.toString())
                .enabled(true)
                .tenantId(tenantId)
                .build();
        jobRepository.save(def);

        taskScheduler.schedule(() -> {
            TenantContextHolder.set(TenantContext.builder().tenantId(tenantId).build());
            try {
                log.info("Executing one-time dynamic job [{}] for tenant [{}]", jobId, tenantId);
                updateJobExecutionStatus(jobId, "SUCCESS");
            } catch (Exception ex) {
                log.error("Job [{}] failed: {}", jobId, ex.getMessage(), ex);
                updateJobExecutionStatus(jobId, "FAILED");
            } finally {
                TenantContextHolder.clear();
            }
        }, runTime);

        return jobId;
    }

    public void registerJob(String jobKey, String cronExpression, String tenantId, Runnable task) {
        log.info("Registering dynamic scheduled job [{}] for tenant [{}] with cron [{}]", jobKey, tenantId, cronExpression);

        cancelJob(jobKey);

        ScheduledFuture<?> future = taskScheduler.schedule(() -> {
            TenantContextHolder.set(TenantContext.builder().tenantId(tenantId).build());
            try {
                log.info("Executing scheduled job [{}] for tenant [{}]", jobKey, tenantId);
                task.run();
                updateJobExecutionStatus(jobKey, "SUCCESS");
            } catch (Exception ex) {
                log.error("Scheduled job [{}] failed: {}", jobKey, ex.getMessage(), ex);
                updateJobExecutionStatus(jobKey, "FAILED");
            } finally {
                TenantContextHolder.clear();
            }
        }, new CronTrigger(cronExpression));

        scheduledTasks.put(jobKey, future);
    }

    public void cancelJob(String jobKey) {
        ScheduledFuture<?> future = scheduledTasks.remove(jobKey);
        if (future != null) {
            future.cancel(false);
            log.info("Cancelled scheduled job [{}]", jobKey);
        }
    }

    private void updateJobExecutionStatus(String jobKey, String status) {
        jobRepository.findByJobKey(jobKey).ifPresent(job -> {
            job.setLastRunAt(Instant.now());
            job.setLastStatus(status);
            jobRepository.save(job);
        });
    }
}
