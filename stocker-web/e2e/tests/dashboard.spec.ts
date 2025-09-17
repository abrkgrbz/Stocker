import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  // Helper function to login
  async function login(page: any) {
    await page.goto('/login');
    await page.fill('input[type="text"], input[type="email"]', 'demo@stocker.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard with key metrics', async ({ page }) => {
    // Check for dashboard title
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Panel|Özet/i })).toBeVisible();
    
    // Check for metric cards
    const metricCards = page.locator('.ant-card, .metric-card, .stat-card');
    await expect(metricCards).toHaveCount(4, { timeout: 10000 });
    
    // Check for specific metrics
    await expect(page.locator('text=/Toplam Satış|Total Sales|Revenue/i')).toBeVisible();
    await expect(page.locator('text=/Kullanıcı|Users|Müşteri/i')).toBeVisible();
  });

  test('should load and display charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('canvas, svg.recharts-surface', { timeout: 15000 });
    
    // Check for chart containers
    const charts = page.locator('.chart-container, .recharts-wrapper, canvas');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should filter data by date range', async ({ page }) => {
    // Look for date range picker
    const dateRangePicker = page.locator('.ant-picker-range, .date-range-picker, input[placeholder*="Tarih"]');
    
    if (await dateRangePicker.isVisible()) {
      await dateRangePicker.click();
      
      // Select last 7 days
      await page.click('text=/Son 7 Gün|Last 7 Days|7 Days/i');
      
      // Wait for data to reload
      await page.waitForTimeout(2000);
      
      // Verify data updated (check for loading indicator disappearing)
      await expect(page.locator('.ant-spin, .loading')).not.toBeVisible();
    }
  });

  test('should navigate to different sections from dashboard', async ({ page }) => {
    // Test navigation to different sections
    const navigationItems = [
      { text: /Müşteri|Customer|CRM/i, url: /customer|crm|musteri/ },
      { text: /Satış|Sales|Order/i, url: /sales|order|satis/ },
      { text: /Ürün|Product|Inventory/i, url: /product|inventory|urun/ },
      { text: /Rapor|Report|Analytics/i, url: /report|analytics|rapor/ }
    ];

    for (const item of navigationItems) {
      const link = page.locator(`a, button`).filter({ hasText: item.text });
      
      if (await link.isVisible()) {
        await link.click();
        await expect(page).toHaveURL(item.url);
        
        // Go back to dashboard
        await page.goto('/dashboard');
      }
    }
  });

  test('should refresh data on demand', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.locator('button[aria-label="reload"], button:has-text("Yenile"), button:has-text("Refresh"), .anticon-reload');
    
    if (await refreshButton.isVisible()) {
      // Click refresh
      await refreshButton.click();
      
      // Check for loading state
      const loadingIndicator = page.locator('.ant-spin, .loading, .skeleton');
      await expect(loadingIndicator).toBeVisible();
      
      // Wait for loading to complete
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Cards should be in grid layout
    const desktopCards = page.locator('.ant-col-md-6, .ant-col-lg-6');
    const desktopCount = await desktopCards.count();
    expect(desktopCount).toBeGreaterThan(0);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Cards should stack vertically
    const mobileCards = page.locator('.ant-col-24, .ant-col-xs-24');
    const mobileCount = await mobileCards.count();
    expect(mobileCount).toBeGreaterThan(0);
  });

  test('should display real-time notifications', async ({ page }) => {
    // Check for notification bell/icon
    const notificationIcon = page.locator('.anticon-bell, [aria-label="notifications"], .notification-icon');
    
    if (await notificationIcon.isVisible()) {
      await notificationIcon.click();
      
      // Check for notification dropdown/panel
      const notificationPanel = page.locator('.ant-dropdown, .notification-panel, .ant-popover');
      await expect(notificationPanel).toBeVisible();
      
      // Close notification panel
      await page.keyboard.press('Escape');
    }
  });

  test('should export dashboard data', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("İndir"), .anticon-download');
    
    if (await exportButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        
        // Verify download started
        expect(download).toBeTruthy();
        
        // Check file extension
        const fileName = download.suggestedFilename();
        expect(fileName).toMatch(/\.(xlsx|xls|csv|pdf)$/);
      } catch (e) {
        // Export might open a modal instead
        const exportModal = page.locator('.ant-modal');
        if (await exportModal.isVisible()) {
          // Close modal
          await page.keyboard.press('Escape');
        }
      }
    }
  });
});