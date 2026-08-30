import { test, expect } from '@playwright/test';

test.describe('Gateway & Infrastructure Observability Suite', () => {

  test('Gateway Actuator Health check returns UP', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('UP');
  });

  test('Actuator metrics endpoint is accessible', async ({ request }) => {
    const response = await request.get('/actuator/metrics');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.names).toBeDefined();
  });

});
