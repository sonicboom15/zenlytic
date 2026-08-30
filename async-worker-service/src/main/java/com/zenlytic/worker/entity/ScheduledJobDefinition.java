package com.zenlytic.worker.entity;

import com.zenlytic.common.entity.TenantAwareEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "scheduled_jobs")
public class ScheduledJobDefinition extends TenantAwareEntity {

    @Column(name = "job_key", nullable = false, length = 128)
    private String jobKey;

    @Column(name = "job_type", nullable = false, length = 64)
    private String jobType;

    @Column(name = "cron_expression", nullable = false, length = 64)
    private String cronExpression;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "last_run_at")
    private Instant lastRunAt;

    @Column(name = "last_status", length = 32)
    private String lastStatus;

    public ScheduledJobDefinition() {}

    public ScheduledJobDefinition(String jobKey, String jobType, String cronExpression, Boolean enabled, Instant lastRunAt, String lastStatus) {
        this.jobKey = jobKey;
        this.jobType = jobType;
        this.cronExpression = cronExpression;
        this.enabled = enabled != null ? enabled : true;
        this.lastRunAt = lastRunAt;
        this.lastStatus = lastStatus;
    }

    public String getJobKey() { return jobKey; }
    public void setJobKey(String jobKey) { this.jobKey = jobKey; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Instant getLastRunAt() { return lastRunAt; }
    public void setLastRunAt(Instant lastRunAt) { this.lastRunAt = lastRunAt; }

    public String getLastStatus() { return lastStatus; }
    public void setLastStatus(String lastStatus) { this.lastStatus = lastStatus; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String jobKey;
        private String jobType;
        private String cronExpression;
        private Boolean enabled = true;
        private Instant lastRunAt;
        private String lastStatus;
        private String tenantId;

        public Builder jobKey(String jobKey) { this.jobKey = jobKey; return this; }
        public Builder jobType(String jobType) { this.jobType = jobType; return this; }
        public Builder cronExpression(String cronExpression) { this.cronExpression = cronExpression; return this; }
        public Builder enabled(Boolean enabled) { this.enabled = enabled; return this; }
        public Builder lastRunAt(Instant lastRunAt) { this.lastRunAt = lastRunAt; return this; }
        public Builder lastStatus(String lastStatus) { this.lastStatus = lastStatus; return this; }
        public Builder tenantId(String tenantId) { this.tenantId = tenantId; return this; }

        public ScheduledJobDefinition build() {
            ScheduledJobDefinition job = new ScheduledJobDefinition(jobKey, jobType, cronExpression, enabled, lastRunAt, lastStatus);
            if (tenantId != null) {
                job.setTenantId(tenantId);
            }
            return job;
        }
    }
}
