CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL UNIQUE,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(512),
    tax_id VARCHAR(512),
    billing_address TEXT,
    shipping_address TEXT,
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    max_discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    tier VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(tenant_id, status);

-- Seed initial customers for default tenant
INSERT INTO customers (customer_id, tenant_id, name, code, company_name, email, phone, billing_address, shipping_address, credit_limit, current_balance, max_discount_percentage, tier, status, notes)
VALUES
    ('cust-001', 'default', 'Apex Global Industries', 'APEX-01', 'Apex Global Corp', 'purchasing@apexcorp.com', '555-0100', '100 Enterprise Way, Suite 400, New York, NY', '100 Enterprise Way, Suite 400, New York, NY', 50000.00, 4200.00, 25.00, 'PLATINUM', 'ACTIVE', 'VIP enterprise client with priority dispatch'),
    ('cust-002', 'default', 'Beacon Medical Supplies', 'BEACON-02', 'Beacon Healthcare LLC', 'orders@beaconmed.com', '555-0101', '45 Health Ave, Boston, MA', '45 Health Ave, Boston, MA', 25000.00, 1150.00, 18.00, 'GOLD', 'ACTIVE', 'Clinical distribution account'),
    ('cust-003', 'default', 'Crestview Retail Outlets', 'CREST-03', 'Crestview Holdings', 'store@crestview.com', '555-0102', '782 Mall Blvd, Chicago, IL', 'Warehouse 4, 800 Logistics Way, Chicago, IL', 15000.00, 890.00, 12.00, 'STANDARD', 'ACTIVE', 'Regional retail chain'),
    ('cust-004', 'default', 'Delta Logistics Hub', 'DELTA-04', 'Delta Freight Inc', 'dispatch@deltafreight.com', '555-0103', '33 Freight Road, Dallas, TX', '33 Freight Road, Dallas, TX', 10000.00, 0.00, 10.00, 'STANDARD', 'ACTIVE', 'Supply chain partner')
ON CONFLICT (customer_id) DO NOTHING;

