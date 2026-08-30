import { test, expect } from '@playwright/test';
import { getOrCreateTenant, getAuthHeaders, TenantContext } from './fixtures/auth-helper';

test.describe.serial('Dynamic Configuration & Feature Flags Suite', () => {

  let tenant: TenantContext;

  test.beforeAll(async ({ request }) => {
    tenant = await getOrCreateTenant(request);
  });

  test('Save and retrieve dynamic tenant-specific configuration', async ({ request }) => {
    const configKey = 'payment.gateway.provider';
    const configValue = 'STRIPE_V2';

    const saveResponse = await request.post('/api/v1/configs', {
      headers: getAuthHeaders(tenant),
      data: {
        configKey,
        configValue,
        serviceName: 'order-service',
        description: 'Primary payment provider for enterprise checkout',
        isSecret: false
      }
    });

    expect(saveResponse.ok()).toBeTruthy();
    const saveBody = await saveResponse.json();
    expect(saveBody.data.configKey).toBe(configKey);
    expect(saveBody.data.configValue).toBe(configValue);

    // Retrieve by key
    const getResponse = await request.get(`/api/v1/configs/${configKey}`, {
      headers: getAuthHeaders(tenant)
    });

    expect(getResponse.ok()).toBeTruthy();
    const getBody = await getResponse.json();
    expect(getBody.data.configValue).toBe(configValue);
  });

  test('Create and evaluate Feature Flag with TIER strategy', async ({ request }) => {
    const flagKey = `FLAG_CRYPTO_${Date.now()}`;

    const saveResponse = await request.post('/api/v1/feature-flags', {
      headers: getAuthHeaders(tenant),
      data: {
        flagKey,
        enabled: true,
        strategy: 'TIER',
        targetTier: 'ENTERPRISE',
        description: 'Enterprise tier exclusive crypto payments',
        rolloutPercentage: 100
      }
    });

    expect(saveResponse.ok()).toBeTruthy();
    const saveBody = await saveResponse.json();
    expect(saveBody.data.flagKey).toBe(flagKey);
    expect(saveBody.data.enabled).toBe(true);

    // Evaluate flag for ENTERPRISE tier
    const evalResponse = await request.get(`/api/v1/feature-flags/${flagKey}/evaluate?tier=ENTERPRISE`, {
      headers: getAuthHeaders(tenant)
    });

    expect(evalResponse.ok()).toBeTruthy();
    const evalBody = await evalResponse.json();
    expect(evalBody.data.enabled).toBe(true);
  });

  test('Feature flag evaluates to false for non-matching STARTER tier', async ({ request }) => {
    const flagKey = `FLAG_ADV_ANALYTICS_${Date.now()}`;

    await request.post('/api/v1/feature-flags', {
      headers: getAuthHeaders(tenant),
      data: {
        flagKey,
        enabled: true,
        strategy: 'TIER',
        targetTier: 'ENTERPRISE',
        description: 'Enterprise analytics only'
      }
    });

    const evalResponse = await request.get(`/api/v1/feature-flags/${flagKey}/evaluate?tier=STARTER`, {
      headers: getAuthHeaders(tenant)
    });

    expect(evalResponse.ok()).toBeTruthy();
    const evalBody = await evalResponse.json();
    expect(evalBody.data.enabled).toBe(false);
  });

});
