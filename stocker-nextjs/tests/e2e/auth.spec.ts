import { test, expect } from '@playwright/test';

test.describe('Authentication & CRM Access', () => {
    test('should login successfully and access CRM dashboard', async ({ page }) => {
        // 1. Navigate to Login Page
        await page.goto('/login');

        // 2. Step 1: Email
        await page.waitForSelector('#email-input');
        await page.fill('#email-input', 'pokiba1438@cucadas.com');
        await page.click('button[type="submit"]');

        // 3. Step 2: Tenant Selection
        // Wait for the tenant selection step to appear
        await page.waitForSelector('text=Çalışma alanı seçin', { timeout: 10000 }).catch(() => {
            console.log("Tenant selection header not found, checking if we skipped to password");
        });

        // Check if we are selecting a tenant or if it auto-redirected (unlikely based on code)
        // We expect a list of buttons. Click the first available tenant.
        const tenantButton = page.locator('.space-y-3 > button').first();
        if (await tenantButton.isVisible()) {
            console.log("Selecting first tenant...");
            await tenantButton.click();
        }

        // 4. Step 3: Password 
        // This involves a redirect to a subdomain. Playwright handles this but we should wait for the password input.
        await page.waitForSelector('#password-input', { timeout: 20000 });
        await page.fill('#password-input', 'A.bg010203');

        // 5. Submit Password
        await page.click('button:has-text("Giriş yap")');

        // 6. Verify Redirect to Dashboard
        // The app redirects to /app after login
        // Note: Playwright might need to handle new page context if it opens in new tab, but standard redirect is same tab.
        await page.waitForURL(/.*\/app/, { timeout: 30000 });

        // 7. Verify Critical Elements
        // Wait for main dashboard container
        await expect(page.locator('.ant-app')).toBeVisible({ timeout: 20000 });

        // Take a screenshot of the dashboard
        await page.screenshot({ path: 'crm-dashboard-success.png' });
    });
});
