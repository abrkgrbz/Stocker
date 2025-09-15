import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testUsers, testTenants } from './fixtures/test-data';

test.describe('Tenant Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await page.waitForURL(/dashboard/);
    
    // Navigate to tenants
    await page.click('text=Tenants');
    await page.waitForLoadState('networkidle');
  });

  test('should display tenants list', async ({ page }) => {
    // Check table is visible
    const table = page.locator('.ant-table, table');
    await expect(table).toBeVisible();
    
    // Check table headers
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Subdomain')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Plan')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
  });

  test('should create new tenant', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create"), button:has-text("New Tenant")');
    
    // Fill form
    await page.fill('input[name="name"]', testTenants.valid.name);
    await page.fill('input[name="subdomain"]', testTenants.valid.subdomain);
    await page.fill('input[name="email"]', testTenants.valid.email);
    await page.fill('input[name="phone"]', testTenants.valid.phone);
    await page.fill('textarea[name="address"]', testTenants.valid.address);
    
    // Select plan
    await page.click('.ant-select-selector');
    await page.click(`text=${testTenants.valid.plan}`);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Check success message
    await expect(page.locator('text=/created.*success/i')).toBeVisible();
    
    // Verify in list
    await expect(page.locator(`text=${testTenants.valid.name}`)).toBeVisible();
  });

  test('should validate subdomain availability', async ({ page }) => {
    // Open create form
    await page.click('button:has-text("Create")');
    
    // Enter existing subdomain
    await page.fill('input[name="subdomain"]', 'existing');
    await page.press('input[name="subdomain"]', 'Tab');
    
    // Should show unavailable message
    await expect(page.locator('text=/already.*taken|unavailable/i')).toBeVisible();
  });

  test('should edit tenant details', async ({ page }) => {
    // Click edit on first tenant
    await page.click('.ant-table-row:first-child button:has-text("Edit")');
    
    // Update name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Tenant Name');
    
    // Save
    await page.click('button:has-text("Save")');
    
    // Check success
    await expect(page.locator('text=/updated.*success/i')).toBeVisible();
    
    // Verify change
    await expect(page.locator('text=Updated Tenant Name')).toBeVisible();
  });

  test('should suspend and activate tenant', async ({ page }) => {
    // Click suspend on first active tenant
    const firstRow = page.locator('.ant-table-row:first-child');
    await firstRow.locator('button:has-text("Suspend")').click();
    
    // Confirm
    await page.click('.ant-modal button:has-text("Confirm")');
    
    // Check status changed
    await expect(firstRow.locator('text=Suspended')).toBeVisible();
    
    // Activate again
    await firstRow.locator('button:has-text("Activate")').click();
    await page.click('.ant-modal button:has-text("Confirm")');
    
    // Check status
    await expect(firstRow.locator('text=Active')).toBeVisible();
  });

  test('should delete tenant', async ({ page }) => {
    // Get tenant name for verification
    const tenantName = await page.locator('.ant-table-row:last-child td:first-child').textContent();
    
    // Click delete on last tenant
    await page.click('.ant-table-row:last-child button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('.ant-modal button:has-text("Delete")');
    
    // Check success message
    await expect(page.locator('text=/deleted.*success/i')).toBeVisible();
    
    // Verify removed from list
    if (tenantName) {
      await expect(page.locator(`text=${tenantName}`)).not.toBeVisible();
    }
  });

  test('should filter tenants by status', async ({ page }) => {
    // Click filter
    await page.click('button:has-text("Filter")');
    
    // Select Active
    await page.click('text=Active');
    
    // Apply filter
    await page.click('button:has-text("Apply")');
    
    // Check all visible are active
    const statuses = page.locator('.ant-table-row .status-badge');
    const count = await statuses.count();
    
    for (let i = 0; i < count; i++) {
      const text = await statuses.nth(i).textContent();
      expect(text).toContain('Active');
    }
  });

  test('should search tenants', async ({ page }) => {
    // Search for specific tenant
    await page.fill('input[placeholder*="Search"]', 'Test Company');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    // Wait for results
    await page.waitForLoadState('networkidle');
    
    // Check results contain search term
    const results = page.locator('.ant-table-row');
    const count = await results.count();
    
    if (count > 0) {
      const firstResult = await results.first().textContent();
      expect(firstResult).toContain('Test');
    }
  });

  test('should view tenant details', async ({ page }) => {
    // Click view details
    await page.click('.ant-table-row:first-child a:has-text("View")');
    
    // Check details page
    await expect(page.locator('text=Tenant Details')).toBeVisible();
    await expect(page.locator('text=Company Information')).toBeVisible();
    await expect(page.locator('text=Subscription')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Activity')).toBeVisible();
  });

  test('should export tenants list', async ({ page }) => {
    // Setup download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click export
    await page.click('button:has-text("Export")');
    
    // Select format
    await page.click('text=Excel');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/tenants.*\.xlsx?/);
  });

  test('should handle bulk operations', async ({ page }) => {
    // Select multiple tenants
    await page.click('.ant-table-row:nth-child(1) input[type="checkbox"]');
    await page.click('.ant-table-row:nth-child(2) input[type="checkbox"]');
    
    // Click bulk actions
    await page.click('button:has-text("Bulk Actions")');
    
    // Select suspend
    await page.click('text=Suspend Selected');
    
    // Confirm
    await page.click('.ant-modal button:has-text("Confirm")');
    
    // Check success
    await expect(page.locator('text=/suspended.*success/i')).toBeVisible();
  });

  test('should paginate through tenants', async ({ page }) => {
    // Check pagination exists
    const pagination = page.locator('.ant-pagination');
    await expect(pagination).toBeVisible();
    
    // Go to next page if available
    const nextButton = pagination.locator('button[aria-label="Next"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // Wait for new data
      await page.waitForLoadState('networkidle');
      
      // Check page changed
      const currentPage = pagination.locator('.ant-pagination-item-active');
      await expect(currentPage).toHaveText('2');
    }
  });
});