import { test, expect } from '@playwright/test';
import { getOrCreateTenant, getAuthHeaders, TenantContext } from './fixtures/auth-helper';

test.describe.serial('Async Worker, Job Scheduling & DLQ Redrive Suite', () => {

  let tenant: TenantContext;

  test.beforeAll(async ({ request }) => {
    tenant = await getOrCreateTenant(request);
  });

  test('Schedule and cancel a dynamic tenant Quartz cron job', async ({ request }) => {
    const jobKey = `job-daily-audit-${Date.now()}`;
    const cron = '0 0 3 * * ?';

    // 1. Schedule Job
    const scheduleResp = await request.post(`/api/v1/jobs/schedule?jobKey=${jobKey}&cron=${encodeURIComponent(cron)}`, {
      headers: getAuthHeaders(tenant)
    });

    expect(scheduleResp.ok()).toBeTruthy();
    const scheduleBody = await scheduleResp.json();
    expect(scheduleBody.success).toBe(true);

    // 2. Cancel Job
    const cancelResp = await request.delete(`/api/v1/jobs/${jobKey}`, {
      headers: getAuthHeaders(tenant)
    });

    expect(cancelResp.ok()).toBeTruthy();
    const cancelBody = await cancelResp.json();
    expect(cancelBody.success).toBe(true);
  });

  test('Trigger Dead Letter Queue (DLQ) Parking Lot Redrive', async ({ request }) => {
    const response = await request.post('/api/v1/dlq/redrive?dlqTopic=orders.dlq&targetTopic=orders.events&maxMessages=10', {
      headers: getAuthHeaders(tenant)
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.dlqTopic).toBe('orders.dlq');
    expect(body.data.targetTopic).toBe('orders.events');
    expect(body.data.replayedCount).toBeGreaterThanOrEqual(0);
  });

});
