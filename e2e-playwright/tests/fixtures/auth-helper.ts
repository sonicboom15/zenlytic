import { APIRequestContext, expect } from '@playwright/test';

export interface TenantContext {
  tenantId: string;
  adminEmail: string;
  adminPassword: string;
  jwtToken: string;
}

let cachedContext: TenantContext | null = null;

export async function getOrCreateTenant(request: APIRequestContext): Promise<TenantContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const tenantId = `tenant-pw-${Math.floor(1000 + Math.random() * 9000)}`;
  const adminEmail = `admin@${tenantId}.com`;
  const adminPassword = 'Password123!';

  const response = await request.post('/api/v1/tenants/register', {
    data: {
      tenantId,
      name: 'Playwright Enterprise Suite',
      adminEmail,
      adminPassword,
      tier: 'ENTERPRISE'
    }
  });

  expect(response.status()).toBe(201);
  const body = await response.json();

  cachedContext = {
    tenantId,
    adminEmail,
    adminPassword,
    jwtToken: body.data.token
  };

  return cachedContext;
}

export function getAuthHeaders(ctx: TenantContext) {
  return {
    'Authorization': `Bearer ${ctx.jwtToken}`,
    'X-Tenant-Id': ctx.tenantId
  };
}
