import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    // Check for registration form elements
    await expect(page.locator('h1, h2').filter({ hasText: /Register|Kayıt|Sign Up/i })).toBeVisible();
    
    // Check for required fields
    await expect(page.locator('input[name="name"], input[placeholder*="Ad"]')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible(); // Confirm password
    
    // Check for submit button
    await expect(page.locator('button[type="submit"], button:has-text("Kayıt Ol"), button:has-text("Register")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"], button:has-text("Kayıt Ol"), button:has-text("Register")');
    
    // Check for validation errors
    await expect(page.locator('.ant-form-item-explain-error, .error-message, [role="alert"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Fill invalid email
    await page.fill('input[name="name"], input[placeholder*="Ad"]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'Password123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for email validation error
    const emailError = page.locator('text=/Invalid email|Geçersiz e-posta|email format/i');
    await expect(emailError).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    // Fill weak password
    await page.fill('input[name="name"], input[placeholder*="Ad"]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"]').first().fill('weak');
    
    // Check for password strength indicator or error
    const passwordError = page.locator('text=/weak|güçlü değil|at least|en az/i');
    await expect(passwordError).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    // Fill mismatched passwords
    await page.fill('input[name="name"], input[placeholder*="Ad"]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    
    const passwords = page.locator('input[type="password"]');
    await passwords.first().fill('Password123!');
    await passwords.nth(1).fill('DifferentPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for password mismatch error
    const mismatchError = page.locator('text=/match|eşleş|confirm|doğrula/i');
    await expect(mismatchError).toBeVisible();
  });

  test('should show error for existing email', async ({ page }) => {
    // Fill form with existing email
    await page.fill('input[name="name"], input[placeholder*="Ad"]', 'New User');
    await page.fill('input[type="email"], input[name="email"]', 'demo@stocker.com');
    
    const passwords = page.locator('input[type="password"]');
    await passwords.first().fill('NewPassword123!');
    await passwords.nth(1).fill('NewPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for API response
    await page.waitForTimeout(2000);
    
    // Check for duplicate email error
    const duplicateError = page.locator('text=/already exists|zaten var|already registered|kayıtlı/i');
    await expect(duplicateError).toBeVisible();
  });

  test('should successfully register new user', async ({ page }) => {
    // Generate unique email
    const timestamp = Date.now();
    const email = `newuser${timestamp}@example.com`;
    
    // Fill registration form
    await page.fill('input[name="name"], input[placeholder*="Ad"]', 'New Test User');
    await page.fill('input[type="email"], input[name="email"]', email);
    
    const passwords = page.locator('input[type="password"]');
    await passwords.first().fill('SecurePassword123!');
    await passwords.nth(1).fill('SecurePassword123!');
    
    // Accept terms if present
    const termsCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /terms|şartlar|agree|kabul/i });
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(login|dashboard|verify)/);
    
    // Check for success message
    const successMessage = page.locator('.ant-message-success, text=/success|başarılı|registered|kayıt/i');
    await expect(successMessage).toBeVisible();
  });

  test('should handle terms and conditions', async ({ page }) => {
    const termsLink = page.locator('a').filter({ hasText: /terms|şartlar|conditions|koşul/i });
    
    if (await termsLink.isVisible()) {
      // Click terms link
      await termsLink.click();
      
      // Check if modal or new page opened
      const modal = page.locator('.ant-modal');
      if (await modal.isVisible()) {
        // Verify terms content is displayed
        await expect(modal.locator('.ant-modal-body')).toBeVisible();
        
        // Close modal
        await page.click('.ant-modal-close, button:has-text("Close"), button:has-text("Kapat")');
      } else {
        // Check if opened in new tab
        await expect(page).toHaveURL(/terms|conditions/);
        
        // Go back to registration
        await page.goBack();
      }
    }
  });

  test('should navigate to login page', async ({ page }) => {
    // Find login link
    const loginLink = page.locator('a').filter({ hasText: /login|giriş|sign in/i });
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      
      // Should navigate to login page
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should handle social registration if available', async ({ page }) => {
    // Check for social registration buttons
    const googleButton = page.locator('button, a').filter({ hasText: /Google/i });
    const githubButton = page.locator('button, a').filter({ hasText: /GitHub/i });
    
    if (await googleButton.isVisible()) {
      // Verify Google button is clickable
      await expect(googleButton).toBeEnabled();
    }
    
    if (await githubButton.isVisible()) {
      // Verify GitHub button is clickable
      await expect(githubButton).toBeEnabled();
    }
  });
});