-- Products Table with Soft Delete support
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    category VARCHAR(128),
    status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tenant_sku ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_tenant_deleted ON products(tenant_id, deleted_at);

-- Transactional Outbox Events Table
CREATE TABLE IF NOT EXISTS outbox_events (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    event_id VARCHAR(64) NOT NULL UNIQUE,
    event_type VARCHAR(128) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_created ON outbox_events(status, created_at);
