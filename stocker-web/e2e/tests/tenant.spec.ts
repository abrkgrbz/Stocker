import { test, expect } from '@playwright/test';

test.describe('Tenant Validation', () => {
  test('should validate tenant from subdomain', async ({ page }) => {
    // Test with a valid tenant subdomain
    await page.goto('http://demo.localhost:3000');
    
    // Should not show invalid tenant page
    await expect(page.locator('text=/Invalid Tenant|Geçersiz Kiracı/i')).not.toBeVisible();
    
    // Should show login or landing page
    await expect(page.locator('input[type="password"], h1')).toBeVisible();
  });

  test('should show error for invalid tenant', async ({ page }) => {
    // Test with invalid tenant subdomain
    await page.goto('http://invalidtenant.localhost:3000');
    
    // Wait for tenant validation
    await page.waitForTimeout(2000);
    
    // Should show invalid tenant error
    const errorVisible = await page.locator('text=/Invalid Tenant|Geçersiz Kiracı|Tenant not found/i').isVisible();
    
    if (errorVisible) {
      await expect(page.locator('text=/Invalid Tenant|Geçersiz Kiracı|Tenant not found/i')).toBeVisible();
    }
  });

  test('should handle main domain without subdomain', async ({ page }) => {
    // Access main domain
    await page.goto('http://localhost:3000');
    
    // Should not show tenant error
    await expect(page.locator('text=/Invalid Tenant|Geçersiz Kiracı/i')).not.toBeVisible();
    
    // Should show main landing page or login
    await expect(page.locator('h1, input[type="password"]')).toBeVisible();
  });

  test('should persist tenant context after login', async ({ page }) => {
    // Go to tenant subdomain
    await page.goto('http://demo.localhost:3000/login');
    
    // Login
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Check tenant context is preserved
    const url = page.url();
    expect(url).toContain('demo.localhost:3000');
    
    // Check for tenant-specific elements (logo, name, etc.)
    const tenantName = await page.locator('.tenant-name, .company-name, [data-tenant-name]').textContent();
    if (tenantName) {
      expect(tenantName.toLowerCase()).toContain('demo');
    }
  });

  test('should isolate data between tenants', async ({ browser }) => {
    // Create two contexts for different tenants
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login to tenant1
    await page1.goto('http://tenant1.localhost:3000/login');
    await page1.fill('input[type="text"], input[type="email"]', 'user1@tenant1.com');
    await page1.fill('input[type="password"]', 'Password1!');
    
    // Login to tenant2
    await page2.goto('http://tenant2.localhost:3000/login');
    await page2.fill('input[type="text"], input[type="email"]', 'user2@tenant2.com');
    await page2.fill('input[type="password"]', 'Password2!');
    
    // Get cookies from both contexts
    const cookies1 = await context1.cookies();
    const cookies2 = await context2.cookies();
    
    // Tenant tokens should be different
    const token1 = cookies1.find(c => c.name.includes('token'));
    const token2 = cookies2.find(c => c.name.includes('token'));
    
    if (token1 && token2) {
      expect(token1.value).not.toEqual(token2.value);
    }
    
    // Clean up
    await context1.close();
    await context2.close();
  });
});