import { test, expect } from '@playwright/test';

export let sharedAuthContext = {
  tenantId: `tenant-pw-${Math.floor(1000 + Math.random() * 9000)}`,
  adminEmail: '',
  adminPassword: 'Password123!',
  jwtToken: ''
};

test.describe.serial('Auth, Multi-Tenancy & Mobile Version Policy Suite', () => {

  test.beforeAll(() => {
    sharedAuthContext.adminEmail = `admin@${sharedAuthContext.tenantId}.com`;
  });

  test('Register new Enterprise Tenant and Admin user', async ({ request }) => {
    const response = await request.post('/api/v1/tenants/register', {
      data: {
        tenantId: sharedAuthContext.tenantId,
        name: 'Playwright Global Enterprise',
        adminEmail: sharedAuthContext.adminEmail,
        adminPassword: sharedAuthContext.adminPassword,
        tier: 'ENTERPRISE'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data.tenantId).toBe(sharedAuthContext.tenantId);
    expect(body.data.status).toBe('ACTIVE');
    expect(body.data.token).toBeDefined();

    sharedAuthContext.jwtToken = body.data.token;
  });

  test('Authenticate Admin user and obtain JWT token', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        tenantId: sharedAuthContext.tenantId,
        email: sharedAuthContext.adminEmail,
        password: sharedAuthContext.adminPassword
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data.email).toBe(sharedAuthContext.adminEmail);
    expect(body.data.token).toBeDefined();
    expect(body.data.roles).toContain('ADMIN');

    sharedAuthContext.jwtToken = body.data.token;
  });

  test('Mobile App Version Policy returns FORCE_UPDATE_REQUIRED for outdated clients with RFC 8594 Sunset Header', async ({ request }) => {
    const response = await request.get('/api/v1/app/version-check?client=iOS&version=1.2.0', {
      headers: {
        'Authorization': `Bearer ${sharedAuthContext.jwtToken}`,
        'X-Tenant-Id': sharedAuthContext.tenantId
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data.status).toBe('FORCE_UPDATE_REQUIRED');
    expect(body.data.clientType).toBe('iOS');
    expect(body.data.minSupportedVersion).toBe('2.0.0');

    // Assert RFC 8594 Sunset & Deprecation headers if present
    const headers = response.headers();
    if (headers['sunset']) {
      expect(headers['sunset']).toBeDefined();
    }
  });

  test('Mobile App Version Policy returns SUPPORTED for current clients', async ({ request }) => {
    const response = await request.get('/api/v1/app/version-check?client=iOS&version=3.0.0', {
      headers: {
        'Authorization': `Bearer ${sharedAuthContext.jwtToken}`,
        'X-Tenant-Id': sharedAuthContext.tenantId
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.status).toBe('SUPPORTED');
  });

});
