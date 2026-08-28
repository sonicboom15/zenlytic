-- Scheduled Job Definitions Table
CREATE TABLE IF NOT EXISTS scheduled_job_definitions (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL UNIQUE,
    job_name VARCHAR(128) NOT NULL,
    tenant_id VARCHAR(64),
    trigger_time TIMESTAMP WITH TIME ZONE,
    cron_expression VARCHAR(64),
    payload TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_tenant ON scheduled_job_definitions(tenant_id, status);

-- Webhook Delivery Logs Table
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    endpoint_url VARCHAR(512) NOT NULL,
    response_status INT,
    duration_ms BIGINT,
    success BOOLEAN NOT NULL,
    signature VARCHAR(128),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_tenant ON webhook_delivery_logs(tenant_id, created_at);

-- ShedLock Distributed Locks Table
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);
