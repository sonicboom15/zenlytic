-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(64) NOT NULL DEFAULT 'STARTER',
    status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE',
    webhook_url VARCHAR(512),
    webhook_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    tenant_id VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(512),
    status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- User Permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    permission VARCHAR(64) NOT NULL,
    PRIMARY KEY (user_id, permission)
);

-- App Version Policies
CREATE TABLE IF NOT EXISTS app_version_policies (
    id BIGSERIAL PRIMARY KEY,
    client_type VARCHAR(32) NOT NULL UNIQUE,
    min_supported_version VARCHAR(32) NOT NULL,
    latest_version VARCHAR(32) NOT NULL,
    update_url VARCHAR(512),
    upgrade_title VARCHAR(255),
    upgrade_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Seed default app version policy
INSERT INTO app_version_policies (client_type, min_supported_version, latest_version, update_url, upgrade_title, upgrade_message)
VALUES
('iOS', '2.0.0', '3.0.0', 'https://apps.apple.com/app/id123456789', 'App Update Required', 'Please update to continue using the application.'),
('Android', '2.0.0', '3.0.0', 'https://play.google.com/store/apps/details?id=com.zenlytic.app', 'App Update Required', 'Please update to continue using the application.')
ON CONFLICT (client_type) DO NOTHING;
