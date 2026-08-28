-- Configuration Entries Table
CREATE TABLE IF NOT EXISTS config_entries (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(128) NOT NULL,
    config_value TEXT NOT NULL,
    tenant_id VARCHAR(64),
    service_name VARCHAR(64),
    environment VARCHAR(32) NOT NULL DEFAULT 'ALL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_config_key_tenant ON config_entries(config_key, tenant_id, service_name);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id BIGSERIAL PRIMARY KEY,
    flag_key VARCHAR(128) NOT NULL UNIQUE,
    description VARCHAR(512),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    strategy VARCHAR(32) NOT NULL DEFAULT 'BOOLEAN',
    target_tier VARCHAR(32),
    target_tenants VARCHAR(1024),
    rollout_percentage INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Seed default global configurations and feature flags
INSERT INTO config_entries (config_key, config_value, tenant_id, service_name)
VALUES
('auth.jwt.expiration', '86400000', NULL, NULL),
('rate.limit.default', '100', NULL, NULL),
('max.upload.mb', '50', NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO feature_flags (flag_key, description, enabled, strategy)
VALUES
('PRODUCT_CATALOG', 'Enables product catalog browsing and management', TRUE, 'BOOLEAN'),
('ORDER_CHECKOUT', 'Enables order checkout and payment processing', TRUE, 'BOOLEAN'),
('ADVANCED_ANALYTICS', 'Enables enterprise reporting dashboards', TRUE, 'TIER')
ON CONFLICT (flag_key) DO NOTHING;
