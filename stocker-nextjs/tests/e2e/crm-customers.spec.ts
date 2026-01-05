import { test, expect, Page } from '@playwright/test';

// Test credentials and tenant config
const TEST_USER = {
    email: 'pokiba1438@cucadas.com',
    password: 'A.bg010203',
    tenantSubdomain: 'zxc' // Tenant subdomain after login
};

const AUTH_BASE_URL = 'https://auth.stoocker.app';
const TENANT_BASE_URL = `https://${TEST_USER.tenantSubdomain}.stoocker.app`;

/**
 * Helper function to handle cookie consent modal
 */
async function handleCookieConsent(page: Page) {
    await page.waitForTimeout(500);
    const acceptButton = page.locator('button:has-text("Kabul Et")');
    const isVisible = await acceptButton.isVisible().catch(() => false);
    if (isVisible) {
        await acceptButton.click();
        await page.waitForTimeout(300);
    }
}

/**
 * Helper function to perform full login flow
 */
async function performLogin(page: Page) {
    // Go to auth login page
    await page.goto(`${AUTH_BASE_URL}/login`);
    await handleCookieConsent(page);

    // Step 1: Enter email
    await page.waitForSelector('input[placeholder="ornek@sirket.com"]', { timeout: 10000 });
    await page.fill('input[placeholder="ornek@sirket.com"]', TEST_USER.email);
    await page.click('button:has-text("Devam et")');

    // Step 2: Select tenant
    await page.waitForSelector('text=Çalışma alanı seçin', { timeout: 10000 });
    const tenantButton = page.locator(`button:has-text("${TEST_USER.tenantSubdomain}.stoocker.app")`);
    await tenantButton.click();

    // Step 3: Enter password (now on tenant subdomain)
    await page.waitForURL(/.*\.stoocker\.app\/login/, { timeout: 15000 });
    await handleCookieConsent(page);

    await page.waitForSelector('input[placeholder="••••••••"]', { timeout: 10000 });
    await page.fill('input[placeholder="••••••••"]', TEST_USER.password);
    await page.click('button:has-text("Giriş yap")');

    // Wait for redirect to app dashboard
    await page.waitForURL(`${TENANT_BASE_URL}/app`, { timeout: 30000 });
    await handleCookieConsent(page);
}

/**
 * Navigate to CRM Customers page after login
 */
async function navigateToCustomers(page: Page) {
    await page.goto(`${TENANT_BASE_URL}/crm/customers`);
    await handleCookieConsent(page);
    await page.waitForLoadState('networkidle');
    // Wait for table to be visible
    await page.waitForSelector('.ant-table-tbody', { timeout: 15000 });
}

test.describe('CRM Customers CRUD', () => {
    test.setTimeout(120000); // 2 minutes timeout for each test

    test.beforeEach(async ({ page }) => {
        await performLogin(page);
    });

    test('should navigate to customers list and see existing customers', async ({ page }) => {
        await navigateToCustomers(page);

        // Verify page title
        await expect(page.locator('h1:has-text("Müşteriler")')).toBeVisible();

        // Verify table is visible
        await expect(page.locator('.ant-table')).toBeVisible();
    });

    test('should create a new customer', async ({ page }) => {
        // Navigate to new customer page
        await page.goto(`${TENANT_BASE_URL}/crm/customers/new`);
        await handleCookieConsent(page);
        await page.waitForLoadState('networkidle');

        const uniqueName = `E2E Test Müşteri ${Date.now()}`;
        const uniqueEmail = `e2etest${Date.now()}@example.com`;

        // Fill customer form
        await page.fill('input[placeholder="Firma Adı Girin..."]', uniqueName);
        await page.fill('input[placeholder="ornek@firma.com"]', uniqueEmail);

        // Submit form
        await page.click('button:has-text("Kaydet")');

        // Wait for redirect back to list
        await page.waitForURL(/\/crm\/customers(?!\/new)/, { timeout: 15000 });

        // Verify customer appears in list
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 10000 });
    });

    test('should view customer details by clicking on row', async ({ page }) => {
        await navigateToCustomers(page);

        // Click on first customer row
        const firstRow = page.locator('.ant-table-tbody tr').first();
        await firstRow.click();

        // Should navigate to customer detail page with GUID in URL
        await page.waitForURL(/\/crm\/customers\/[a-f0-9-]{36}$/i, { timeout: 10000 });

        // Verify detail page loaded
        await page.waitForLoadState('networkidle');
    });

    test('should edit a customer via action menu', async ({ page }) => {
        await navigateToCustomers(page);

        // Find first row and open action dropdown
        const firstRow = page.locator('.ant-table-tbody tr').first();
        const actionButton = firstRow.locator('button').last();
        await actionButton.click();

        // Click "Düzenle" option
        await page.locator('.ant-dropdown-menu-item:has-text("Düzenle")').click();

        // Should navigate to edit page with GUID
        await page.waitForURL(/\/crm\/customers\/[a-f0-9-]{36}\/edit/i, { timeout: 10000 });

        // Verify edit form is visible
        await expect(page.locator('button:has-text("Kaydet")')).toBeVisible();
    });

    test('should delete a customer', async ({ page }) => {
        // First create a customer to delete
        await page.goto(`${TENANT_BASE_URL}/crm/customers/new`);
        await handleCookieConsent(page);

        const deleteTestName = `DELETE TEST ${Date.now()}`;
        const deleteTestEmail = `delete${Date.now()}@test.com`;

        await page.fill('input[placeholder="Firma Adı Girin..."]', deleteTestName);
        await page.fill('input[placeholder="ornek@firma.com"]', deleteTestEmail);
        await page.click('button:has-text("Kaydet")');

        // Wait for redirect
        await page.waitForURL(/\/crm\/customers(?!\/new)/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // Find the row with our test customer
        const row = page.locator('tr', { hasText: deleteTestName }).first();
        await expect(row).toBeVisible({ timeout: 10000 });

        // Open action menu
        const actionButton = row.locator('button').last();
        await actionButton.click();

        // Click "Sil" option
        await page.locator('.ant-dropdown-menu-item:has-text("Sil")').click();

        // Wait for confirmation modal
        await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Müşteriyi Sil')).toBeVisible();

        // Confirm deletion
        await page.click('button.ant-btn-dangerous:has-text("Sil")');

        // Verify customer is removed from list
        await expect(page.locator('tr', { hasText: deleteTestName })).not.toBeVisible({ timeout: 10000 });
    });

    test('full CRUD flow - create, view, edit, delete', async ({ page }) => {
        const uniqueCustomer = {
            name: `CRUD Flow Test ${Date.now()}`,
            email: `crudflow${Date.now()}@test.com`
        };

        // ===== CREATE =====
        await page.goto(`${TENANT_BASE_URL}/crm/customers/new`);
        await handleCookieConsent(page);

        await page.fill('input[placeholder="Firma Adı Girin..."]', uniqueCustomer.name);
        await page.fill('input[placeholder="ornek@firma.com"]', uniqueCustomer.email);
        await page.click('button:has-text("Kaydet")');

        await page.waitForURL(/\/crm\/customers(?!\/new)/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // ===== READ - Verify in list =====
        await expect(page.locator(`text=${uniqueCustomer.name}`)).toBeVisible({ timeout: 10000 });

        // ===== VIEW - Click to see details =====
        const customerRow = page.locator('tr', { hasText: uniqueCustomer.name }).first();
        await customerRow.click();

        await page.waitForURL(/\/crm\/customers\/[a-f0-9-]{36}$/i, { timeout: 10000 });
        await expect(page.locator(`text=${uniqueCustomer.name}`)).toBeVisible();

        // Go back to list
        await page.goto(`${TENANT_BASE_URL}/crm/customers`);
        await handleCookieConsent(page);
        await page.waitForSelector('.ant-table-tbody', { timeout: 15000 });

        // ===== UPDATE - Edit via action menu =====
        const rowForEdit = page.locator('tr', { hasText: uniqueCustomer.name }).first();
        const editActionButton = rowForEdit.locator('button').last();
        await editActionButton.click();
        await page.locator('.ant-dropdown-menu-item:has-text("Düzenle")').click();

        await page.waitForURL(/\/crm\/customers\/[a-f0-9-]{36}\/edit/i, { timeout: 10000 });

        // Make a change (e.g., phone number if available)
        const phoneInput = page.locator('input[type="tel"]');
        if (await phoneInput.isVisible()) {
            await phoneInput.clear();
            await phoneInput.fill('5559999999');
        }
        await page.click('button:has-text("Kaydet")');

        await page.waitForURL(/\/crm\/customers(?!.*\/edit)/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // ===== DELETE =====
        const rowForDelete = page.locator('tr', { hasText: uniqueCustomer.name }).first();
        const deleteActionButton = rowForDelete.locator('button').last();
        await deleteActionButton.click();
        await page.locator('.ant-dropdown-menu-item:has-text("Sil")').click();

        await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 5000 });
        await page.click('button.ant-btn-dangerous:has-text("Sil")');

        // Verify deletion
        await expect(page.locator('tr', { hasText: uniqueCustomer.name })).not.toBeVisible({ timeout: 10000 });
    });
});
