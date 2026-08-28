ALTER TABLE config_entries ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE config_entries ADD COLUMN IF NOT EXISTS description VARCHAR(512);
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);
ALTER TABLE feature_flags DROP CONSTRAINT IF EXISTS feature_flags_flag_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_flag_key_tenant ON feature_flags (flag_key, COALESCE(tenant_id, 'GLOBAL'));
