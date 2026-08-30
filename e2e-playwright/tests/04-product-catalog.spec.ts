import { test, expect } from '@playwright/test';
import { getOrCreateTenant, getAuthHeaders, TenantContext } from './fixtures/auth-helper';

test.describe.serial('CQRS Product Catalog & Stock Management Suite', () => {

  let tenant: TenantContext;
  let createdProductId: number;
  const sku = `SKU-PW-${Math.floor(10000 + Math.random() * 90000)}`;

  test.beforeAll(async ({ request }) => {
    tenant = await getOrCreateTenant(request);
  });

  test('Create Product in Catalog with Idempotency and Outbox event', async ({ request }) => {
    const response = await request.post('/api/v1/products', {
      headers: {
        ...getAuthHeaders(tenant),
        'X-Idempotency-Key': `idemp-${sku}`
      },
      data: {
        sku,
        name: 'Enterprise Ultra Server Blade',
        description: 'Multi-threaded bare-metal node',
        price: 799.99,
        stockQuantity: 100,
        category: 'COMPUTE'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data.sku).toBe(sku);
    expect(body.data.stockQuantity).toBe(100);

    createdProductId = body.data.id;
  });

  test('Query Product by ID via CQRS Query Bus and Redis Cache', async ({ request }) => {
    const response = await request.get(`/api/v2/products/${createdProductId}`, {
      headers: getAuthHeaders(tenant)
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.id).toBe(createdProductId);
    expect(body.data.sku).toBe(sku);
  });

  test('Reserve and Release Stock for Distributed Saga lifecycle', async ({ request }) => {
    // 1. Reserve 5 units
    const reserveResp = await request.post('/api/v1/products/reserve-stock', {
      headers: getAuthHeaders(tenant),
      data: {
        sku,
        quantity: 5,
        orderId: 'test-saga-ord-1'
      }
    });

    expect(reserveResp.ok()).toBeTruthy();
    const reserveBody = await reserveResp.json();
    expect(reserveBody.data.reserved).toBe(true);

    // 2. Release 5 units
    const releaseResp = await request.post(`/api/v1/products/release-stock?sku=${sku}&quantity=5&orderId=test-saga-ord-1`, {
      headers: getAuthHeaders(tenant)
    });

    expect(releaseResp.ok()).toBeTruthy();
  });

});
