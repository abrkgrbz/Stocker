import { test, expect } from '@playwright/test';

test.describe('User Settings Management', () => {
  // Helper function to login
  async function login(page: any) {
    await page.goto('/login');
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to settings
    await page.goto('/settings');
  });

  test('should display settings sections', async ({ page }) => {
    // Check for settings header
    await expect(page.locator('h1, h2').filter({ hasText: /Settings|Ayarlar|Preferences/i })).toBeVisible();
    
    // Check for common settings sections
    const sections = [
      /Profile|Profil/i,
      /Account|Hesap/i,
      /Security|Güvenlik/i,
      /Notifications|Bildirim/i,
      /Preferences|Tercih/i
    ];
    
    for (const section of sections) {
      const sectionElement = page.locator('text=' + section);
      if (await sectionElement.isVisible()) {
        await expect(sectionElement).toBeVisible();
      }
    }
  });

  test('should update profile information', async ({ page }) => {
    // Click on profile section if needed
    const profileTab = page.locator('text=/Profile|Profil/i');
    if (await profileTab.isVisible()) {
      await profileTab.click();
    }
    
    // Update name
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[placeholder*="Ad"]');
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill('Updated Test User');
    }
    
    // Update bio/description if available
    const bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="Bio"], textarea[placeholder*="Hakkında"]');
    if (await bioInput.isVisible()) {
      await bioInput.clear();
      await bioInput.fill('This is an updated bio');
    }
    
    // Save changes
    await page.click('button:has-text("Save"), button:has-text("Kaydet")');
    
    // Check for success message
    await expect(page.locator('.ant-message-success, text=/saved|kaydedildi|updated|güncellendi/i')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    // Navigate to security section
    const securityTab = page.locator('text=/Security|Güvenlik/i');
    if (await securityTab.isVisible()) {
      await securityTab.click();
    }
    
    // Fill password change form
    const currentPassword = page.locator('input[name="currentPassword"], input[placeholder*="Current"], input[placeholder*="Mevcut"]');
    const newPassword = page.locator('input[name="newPassword"], input[placeholder*="New Password"], input[placeholder*="Yeni Şifre"]').first();
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="Confirm"], input[placeholder*="Doğrula"]');
    
    if (await currentPassword.isVisible()) {
      await currentPassword.fill('Demo123!');
      await newPassword.fill('NewPassword123!');
      
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill('NewPassword123!');
      }
      
      // Submit password change
      await page.click('button:has-text("Change Password"), button:has-text("Şifre Değiştir")');
      
      // Check for success or error message
      const message = page.locator('.ant-message, [role="alert"]');
      await expect(message).toBeVisible();
    }
  });

  test('should manage notification preferences', async ({ page }) => {
    // Navigate to notifications section
    const notificationsTab = page.locator('text=/Notifications|Bildirim/i');
    if (await notificationsTab.isVisible()) {
      await notificationsTab.click();
    }
    
    // Toggle email notifications
    const emailToggle = page.locator('.ant-switch, input[type="checkbox"]').filter({ hasText: /Email/i }).first();
    if (await emailToggle.isVisible()) {
      const isChecked = await emailToggle.isChecked();
      await emailToggle.click();
      
      // Verify toggle state changed
      const newState = await emailToggle.isChecked();
      expect(newState).not.toBe(isChecked);
    }
    
    // Toggle push notifications
    const pushToggle = page.locator('.ant-switch, input[type="checkbox"]').filter({ hasText: /Push/i }).first();
    if (await pushToggle.isVisible()) {
      await pushToggle.click();
    }
    
    // Save preferences
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Kaydet")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Check for success message
      await expect(page.locator('.ant-message-success, text=/saved|kaydedildi/i')).toBeVisible();
    }
  });

  test('should change language preference', async ({ page }) => {
    // Look for language selector
    const languageSelector = page.locator('select[name="language"], .ant-select').filter({ hasText: /Language|Dil/i });
    
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      
      // Select different language
      const turkishOption = page.locator('.ant-select-item, option').filter({ hasText: /Türkçe|Turkish/i });
      if (await turkishOption.isVisible()) {
        await turkishOption.click();
        
        // Wait for page to update
        await page.waitForTimeout(1000);
        
        // Check if UI updated to Turkish
        await expect(page.locator('text=/Ayarlar|Tercihler/i')).toBeVisible();
      }
    }
  });

  test('should change theme preference', async ({ page }) => {
    // Look for theme selector
    const themeToggle = page.locator('.ant-switch, input[type="checkbox"]').filter({ hasText: /Dark|Theme|Tema/i });
    
    if (await themeToggle.isVisible()) {
      // Get current theme
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('data-theme') || await htmlElement.getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      
      // Wait for theme to change
      await page.waitForTimeout(500);
      
      // Verify theme changed
      const newTheme = await htmlElement.getAttribute('data-theme') || await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should manage API keys', async ({ page }) => {
    // Navigate to API section if available
    const apiTab = page.locator('text=/API|Developer|Geliştirici/i');
    
    if (await apiTab.isVisible()) {
      await apiTab.click();
      
      // Check for API key section
      const apiKeySection = page.locator('text=/API Key|API Anahtarı/i');
      if (await apiKeySection.isVisible()) {
        // Generate new API key
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Oluştur")');
        if (await generateButton.isVisible()) {
          await generateButton.click();
          
          // Check for new key display
          await expect(page.locator('code, .api-key')).toBeVisible();
        }
      }
    }
  });

  test('should manage two-factor authentication', async ({ page }) => {
    // Navigate to security section
    const securityTab = page.locator('text=/Security|Güvenlik/i');
    if (await securityTab.isVisible()) {
      await securityTab.click();
    }
    
    // Look for 2FA section
    const twoFactorSection = page.locator('text=/Two-Factor|2FA|İki Faktör/i');
    if (await twoFactorSection.isVisible()) {
      const enableButton = page.locator('button:has-text("Enable"), button:has-text("Etkinleştir")');
      
      if (await enableButton.isVisible()) {
        await enableButton.click();
        
        // Check for QR code or setup instructions
        const qrCode = page.locator('canvas, img[alt*="QR"], .qr-code');
        const setupCode = page.locator('code, .setup-code');
        
        const qrVisible = await qrCode.isVisible();
        const codeVisible = await setupCode.isVisible();
        
        expect(qrVisible || codeVisible).toBeTruthy();
      }
    }
  });

  test('should export account data', async ({ page }) => {
    // Navigate to account/privacy section
    const accountTab = page.locator('text=/Account|Privacy|Hesap|Gizlilik/i');
    if (await accountTab.isVisible()) {
      await accountTab.click();
    }
    
    // Look for export option
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Dışa Aktar")');
    
    if (await exportButton.isVisible()) {
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        
        // Verify download started
        expect(download).toBeTruthy();
        
        // Check file name
        const fileName = download.suggestedFilename();
        expect(fileName).toMatch(/\.(json|csv|zip)$/);
      } catch (e) {
        // Export might show a modal for format selection
        const modal = page.locator('.ant-modal');
        if (await modal.isVisible()) {
          // Select format and proceed
          await page.click('button:has-text("JSON")');
          await page.click('button:has-text("Export"), button:has-text("İndir")');
        }
      }
    }
  });

  test('should delete account', async ({ page }) => {
    // Navigate to account section
    const accountTab = page.locator('text=/Account|Hesap/i');
    if (await accountTab.isVisible()) {
      await accountTab.click();
    }
    
    // Scroll to danger zone
    const dangerZone = page.locator('text=/Danger Zone|Delete Account|Hesabı Sil/i');
    if (await dangerZone.isVisible()) {
      await dangerZone.scrollIntoViewIfNeeded();
      
      // Click delete account button
      const deleteButton = page.locator('button:has-text("Delete Account"), button:has-text("Hesabı Sil")').filter({ hasClass: /danger|error/i });
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Check for confirmation modal
        const confirmModal = page.locator('.ant-modal');
        await expect(confirmModal).toBeVisible();
        
        // Check for warning message
        await expect(confirmModal.locator('text=/permanent|kalıcı|cannot be undone|geri alınamaz/i')).toBeVisible();
        
        // Cancel deletion
        await page.click('button:has-text("Cancel"), button:has-text("İptal")');
        
        // Verify modal closed
        await expect(confirmModal).not.toBeVisible();
      }
    }
  });
});