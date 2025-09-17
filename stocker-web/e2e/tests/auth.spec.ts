import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    // Check if we're redirected to login
    await expect(page).toHaveURL(/.*login/);
    
    // Check for essential login elements
    await expect(page.locator('input[type="text"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.fill('input[type="text"], input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    
    // Wait for error message
    await expect(page.locator('.ant-message-error, .error-message, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill valid credentials
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check for dashboard elements
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Panel/ })).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    
    // Check for login form
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // First, login
    await page.goto('/login');
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Çıkış"), button:has-text("Logout"), [aria-label="logout"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try opening user menu first
      await page.click('.ant-avatar, .user-menu, [aria-label="user"]');
      await page.click('text=/Çıkış|Logout/i');
    }
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    
    // Try to access dashboard again
    await page.goto('/dashboard');
    
    // Should still be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle remember me functionality', async ({ page, context }) => {
    await page.goto('/login');
    
    // Check remember me checkbox
    const rememberMe = page.locator('input[type="checkbox"]').filter({ hasText: /Remember|Beni Hatırla/i });
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }
    
    // Login
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Get cookies
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('token') || c.name.includes('auth'));
    
    // If remember me works, cookie should have longer expiry
    if (authCookie) {
      const expiryDate = new Date(authCookie.expires * 1000);
      const now = new Date();
      const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Should be more than 1 day if remember me is working
      expect(daysDiff).toBeGreaterThan(1);
    }
  });
});