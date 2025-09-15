import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { testUsers } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page }) => {
    // Check all elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/Stocker Admin|Login/);
    
    // Check form labels
    const emailLabel = page.locator('label:has-text("Email")');
    const passwordLabel = page.locator('label:has-text("Password")');
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should show validation errors for empty form', async () => {
    // Click login without filling form
    await loginPage.loginButton.click();
    
    // Check for validation messages
    const emailError = loginPage.page.locator('text=/email.*required/i');
    const passwordError = loginPage.page.locator('text=/password.*required/i');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should show error for invalid email format', async () => {
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('ValidPass123!');
    await loginPage.loginButton.click();
    
    const emailError = loginPage.page.locator('text=/valid.*email/i');
    await expect(emailError).toBeVisible();
  });

  test('should show error for weak password', async () => {
    await loginPage.emailInput.fill('test@example.com');
    await loginPage.passwordInput.fill('weak');
    await loginPage.loginButton.click();
    
    const passwordError = loginPage.page.locator('text=/password.*must.*8/i');
    await expect(passwordError).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Use test credentials
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.pageTitle).toBeVisible();
  });

  test('should remember user when checkbox is checked', async ({ context }) => {
    // Login with remember me
    await loginPage.login(testUsers.admin.email, testUsers.admin.password, true);
    await loginPage.waitForLoginSuccess();
    
    // Get cookies
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('token'));
    
    // Check cookie has long expiry
    if (authCookie && authCookie.expires) {
      const expiryDate = new Date(authCookie.expires * 1000);
      const now = new Date();
      const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBeGreaterThan(7); // Should remember for at least a week
    }
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.waitForLoginSuccess();
    
    // Then logout
    await dashboardPage.logout();
    
    // Verify redirected to login
    await expect(page).toHaveURL(/login/);
    await expect(loginPage.emailInput).toBeVisible();
  });

  test('should handle session expiry gracefully', async ({ page, context }) => {
    // Login
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.waitForLoginSuccess();
    
    // Clear auth cookies to simulate session expiry
    await context.clearCookies();
    
    // Try to navigate to protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate network failure
    await context.route('**/api/auth/login', route => {
      route.abort('failed');
    });
    
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // Should show error message
    const errorMessage = page.locator('text=/network|connection|failed/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ context }) => {
    // Simulate server error
    await context.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // Should show error message
    const errorMessage = loginPage.page.locator('text=/server.*error/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should prevent multiple login attempts', async () => {
    // Try rapid login attempts
    const attempts = 5;
    for (let i = 0; i < attempts; i++) {
      await loginPage.emailInput.fill('wrong@email.com');
      await loginPage.passwordInput.fill('wrongpass');
      await loginPage.loginButton.click();
      await loginPage.page.waitForTimeout(100);
    }
    
    // Should show rate limit error
    const rateLimitError = loginPage.page.locator('text=/too many.*attempts|rate.*limit/i');
    await expect(rateLimitError).toBeVisible();
  });

  test('should handle 2FA if enabled', async ({ page }) => {
    // Mock 2FA requirement
    await page.route('**/api/auth/login', async route => {
      const request = route.request();
      const data = request.postDataJSON();
      
      if (!data.totp) {
        // First step - return 2FA required
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ requires2FA: true })
        });
      } else {
        // Second step - complete login
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            token: 'mock-token',
            user: testUsers.admin 
          })
        });
      }
    });
    
    // Login with credentials
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    
    // Should show 2FA input
    await expect(loginPage.twoFactorInput).toBeVisible();
    
    // Enter 2FA code
    await loginPage.enterTwoFactorCode('123456');
    
    // Should complete login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should handle password reset flow', async ({ page }) => {
    // Click forgot password
    await loginPage.forgotPasswordLink.click();
    
    // Should navigate to password reset
    await expect(page).toHaveURL(/forgot-password|reset/);
    
    // Check reset form is visible
    const resetEmailInput = page.locator('input[type="email"]');
    const resetButton = page.locator('button:has-text("Reset")');
    
    await expect(resetEmailInput).toBeVisible();
    await expect(resetButton).toBeVisible();
  });
});