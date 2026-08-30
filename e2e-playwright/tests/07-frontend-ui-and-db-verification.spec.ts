import { test, expect, Page } from '@playwright/test';

test.describe('Frontend UI, POS Offline Engine & DB Verification Suite', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';
  const tenantId = `tenant-pw-${Math.floor(1000 + Math.random() * 9000)}`;
  const adminEmail = `admin@${tenantId}.com`;
  const adminPassword = 'Password123!';

  async function ensureLoggedIn(page: Page) {
    await page.goto(FRONTEND_URL);
    const signInBtn = page.getByRole('button', { name: 'Sign In to Workspace' });
    if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('input[placeholder="default"]').fill(tenantId);
      await page.locator('input[placeholder="name@company.com"]').fill(adminEmail);
      await page.locator('input[placeholder="••••••••••••"]').fill(adminPassword);
      await signInBtn.click();
      await expect(page.getByText(`Tenant Overview: [${tenantId}]`)).toBeVisible({ timeout: 10000 });
    }
  }

  test('01. UI Tenant Onboarding and Automatic Routing', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Switch to Register Organization mode
    const registerBtn = page.getByRole('button', { name: '+ Register New Tenant Organization' });
    await registerBtn.click();

    // Fill registration form
    await page.locator('input[placeholder="Acme Global Logistics"]').fill('Playwright Test Enterprise');
    await page.locator('input[placeholder="tenant-acme-global"]').fill(tenantId);
    await page.locator('input[placeholder="name@company.com"]').fill(adminEmail);
    await page.locator('input[placeholder="••••••••••••"]').fill(adminPassword);

    // Submit registration
    await page.getByRole('button', { name: 'Register Organization & Log In' }).click();

    // Assert auto-navigation to dashboard with tenant identifier
    await expect(page.getByText(`Tenant Overview: [${tenantId}]`)).toBeVisible({ timeout: 10000 });
  });

  test('02. B2B Customer Creation with Max Discount Boundary & DB Verification', async ({ page, request }) => {
    await ensureLoggedIn(page);

    // Navigate to Customers tab
    await page.getByRole('button', { name: 'Customers (B2B)' }).click();

    // Open Add Customer Modal
    await page.getByRole('button', { name: 'Add Customer' }).click();
    await page.locator('input[placeholder="Apex Global Industries"]').fill('Northwind Traders');
    await page.locator('input[placeholder="APEX-01"]').fill('NWT-01');
    await page.locator('input[placeholder="Apex Corp LLC"]').fill('Northwind Global Corp');
    await page.locator('input[placeholder="orders@apex.com"]').fill('purchasing@northwind.com');

    // Set Max Discount Limit to 20%
    const discountInput = page.locator('input[type="number"]').first();
    await discountInput.fill('20');

    // Save Customer
    await page.getByRole('button', { name: 'Save Account' }).click();

    // Assert UI Table shows created customer
    await expect(page.getByText('Northwind Traders')).toBeVisible();
    await expect(page.getByText('20% Max')).toBeVisible();

    // DB Verification through API Gateway
    const authRes = await request.post(`${GATEWAY_URL}/api/v1/auth/login`, {
      data: { email: adminEmail, password: adminPassword, tenantId },
      headers: { 'X-Tenant-ID': tenantId }
    });
    const authData = await authRes.json();
    const token = authData.data.token;

    const custDbRes = await request.get(`${GATEWAY_URL}/api/v1/customers?search=Northwind`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });
    expect(custDbRes.status()).toBe(200);
    const custDbData = await custDbRes.json();
    expect(custDbData.data.content.length).toBeGreaterThan(0);
    expect(custDbData.data.content[0].name).toBe('Northwind Traders');
    expect(custDbData.data.content[0].maxDiscountPercentage).toBe(20);
  });

  test('03. Product Catalog Batch Import & DB Verification', async ({ page, request }) => {
    await ensureLoggedIn(page);

    // Navigate to Product Catalog
    await page.getByRole('button', { name: 'Product Catalog' }).click();

    // Open Batch Import modal
    await page.getByRole('button', { name: 'Batch Import' }).click();
    await expect(page.getByText('Batch Import Products (Standard Chassis)')).toBeVisible();

    // Click Start Batch Import
    await page.getByRole('button', { name: 'Start Batch Import' }).click();

    // Assert 3 items succeeded
    await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    // Verify products rendered in catalog
    await expect(page.getByText('Mechanical Keyboard RGB')).toBeVisible();
    await expect(page.getByText('PROD-KB-RGB')).toBeVisible();

    // DB Verification through API Gateway
    const authRes = await request.post(`${GATEWAY_URL}/api/v1/auth/login`, {
      data: { email: adminEmail, password: adminPassword, tenantId },
      headers: { 'X-Tenant-ID': tenantId }
    });
    const token = (await authRes.json()).data.token;

    const prodRes = await request.get(`${GATEWAY_URL}/api/v1/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });
    expect(prodRes.status()).toBe(200);
    const prodData = await prodRes.json();
    expect(prodData.data.content.length).toBeGreaterThanOrEqual(3);
  });

  test('04. POS Terminal: Max Discount Validation & Distributed Saga Placement', async ({ page }) => {
    await ensureLoggedIn(page);

    // Navigate to POS
    await page.getByRole('button', { name: 'POS / New Order' }).click();

    // Select Northwind Traders (max 20% discount cap)
    const customerSelect = page.getByLabel('Select B2B Client Account');
    await customerSelect.selectOption({ label: 'Northwind Traders (NWT-01) - STANDARD Tier [Max 20% Disc]' });

    // Add Mechanical Keyboard RGB
    const addBtn = page.getByText('+ Add').first();
    await addBtn.click();

    // Test Exceeding Discount Cap (Input 25% > 20% limit)
    const discountInput = page.getByRole('spinbutton', { name: '0.0' });
    await discountInput.fill('25');

    // Assert validation error and disabled checkout button
    await expect(page.getByText('Discount cannot exceed client limit of 20%.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Execute Saga Checkout/ })).toBeDisabled();

    // Fix Discount to 10% (within 20% limit)
    await discountInput.fill('10');
    await expect(page.getByText('Discount cannot exceed client limit of 20%.')).not.toBeVisible();

    // Checkout
    const checkoutBtn = page.getByRole('button', { name: /Execute Saga Checkout/ });
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();
    await expect(page.getByText(/confirmed successfully via Saga Orchestrator/)).toBeVisible({ timeout: 10000 });

    // Navigate to Orders & Sagas
    await page.getByRole('button', { name: 'Orders & Sagas' }).click();
    await expect(page.locator('table').getByText('Northwind Traders')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('table').getByText(/CONFIRMED|PENDING/).first()).toBeVisible();

    // Inspect Saga Timeline
    await page.getByRole('button', { name: 'Timeline' }).first().click();
    await expect(page.getByText('Order Details & Saga Orchestrator')).toBeVisible();
    await expect(page.getByText('4-Step Distributed Saga Execution Pipeline:')).toBeVisible();
  });
});
