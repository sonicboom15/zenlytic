import { test, expect } from '@playwright/test';
import { getOrCreateTenant, getAuthHeaders, TenantContext } from './fixtures/auth-helper';

test.describe.serial('Distributed Saga Order Fulfillment & Timeline Suite', () => {

  let tenant: TenantContext;
  let orderId: string;
  let sagaId: string;
  const sku = `SKU-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  test.beforeAll(async ({ request }) => {
    tenant = await getOrCreateTenant(request);

    // Pre-create product to be purchased in saga
    await request.post('/api/v1/products', {
      headers: getAuthHeaders(tenant),
      data: {
        sku,
        name: 'Enterprise Saga Compute Node',
        description: 'Server item for saga orchestration test',
        price: 299.99,
        stockQuantity: 50,
        category: 'COMPUTE'
      }
    });
  });

  test('Submit Order and Orchestrate Distributed Saga Fulfillment (Forward Execution)', async ({ request }) => {
    const response = await request.post('/api/v1/orders', {
      headers: {
        ...getAuthHeaders(tenant),
        'X-Idempotency-Key': `idemp-order-${Date.now()}`
      },
      data: {
        items: [
          {
            sku,
            productName: 'Enterprise Saga Compute Node',
            unitPrice: 299.99,
            quantity: 2
          }
        ]
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data.status).toBe('CONFIRMED');
    expect(body.data.totalAmount).toBe(599.98);
    expect(body.data.orderId).toBeDefined();
    expect(body.data.sagaId).toBeDefined();

    orderId = body.data.orderId;
    sagaId = body.data.sagaId;
  });

  test('Query Saga Step Execution Timeline Audit Log', async ({ request }) => {
    const response = await request.get(`/api/v1/sagas/${sagaId}/timeline`, {
      headers: getAuthHeaders(tenant)
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.sagaId).toBe(sagaId);
    expect(body.data.status).toBe('COMPLETED');
    expect(body.data.steps).toBeDefined();
    expect(body.data.steps.length).toBeGreaterThanOrEqual(4);

    const stepNames = body.data.steps.map((s: any) => s.stepName);
    expect(stepNames).toContain('Create Pending Order');
    expect(stepNames).toContain('Reserve Inventory');
    expect(stepNames).toContain('Process Payment');
    expect(stepNames).toContain('Confirm Order');

    body.data.steps.forEach((step: any) => {
      expect(step.status).toBe('SUCCESS');
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  test('Retrieve confirmed Order details by Order ID', async ({ request }) => {
    const response = await request.get(`/api/v1/orders/${orderId}`, {
      headers: getAuthHeaders(tenant)
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.orderId).toBe(orderId);
    expect(body.data.status).toBe('CONFIRMED');
    expect(body.data.items.length).toBe(1);
    expect(body.data.items[0].sku).toBe(sku);
  });

});
