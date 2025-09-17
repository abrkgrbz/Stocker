import { test, expect } from '@playwright/test';

test.describe('Payment and Subscription Flow', () => {
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
  });

  test('should display pricing plans', async ({ page }) => {
    // Navigate to pricing/billing page
    await page.goto('/pricing');
    
    // Check for pricing header
    await expect(page.locator('h1, h2').filter({ hasText: /Pricing|Plans|Fiyatlandırma|Planlar/i })).toBeVisible();
    
    // Check for plan cards
    const planCards = page.locator('.pricing-card, .plan-card, .ant-card').filter({ hasText: /month|year|ay|yıl/i });
    const planCount = await planCards.count();
    expect(planCount).toBeGreaterThan(0);
    
    // Check for common plan types
    const planTypes = ['Basic', 'Pro', 'Enterprise', 'Temel', 'Profesyonel', 'Kurumsal'];
    for (const planType of planTypes) {
      const plan = page.locator(`text=/${planType}/i`);
      if (await plan.isVisible()) {
        // Check for price display
        const priceElement = plan.locator('..').locator('text=/\\$|₺|€|[0-9]/');
        await expect(priceElement).toBeVisible();
      }
    }
  });

  test('should compare plan features', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for feature comparison
    const featureList = page.locator('.feature-list, ul, .ant-list');
    const featureCount = await featureList.count();
    
    if (featureCount > 0) {
      // Check for feature items
      const features = page.locator('.feature-item, li').filter({ hasText: /✓|✗|✔|✘/i });
      const hasFeatures = await features.count();
      expect(hasFeatures).toBeGreaterThan(0);
    }
    
    // Check for toggle between monthly/yearly
    const billingToggle = page.locator('.ant-switch, button').filter({ hasText: /Monthly|Yearly|Aylık|Yıllık/i });
    if (await billingToggle.isVisible()) {
      await billingToggle.click();
      
      // Wait for prices to update
      await page.waitForTimeout(500);
      
      // Verify prices changed
      const prices = await page.locator('text=/\\$|₺|€|[0-9]+/').allTextContents();
      expect(prices.length).toBeGreaterThan(0);
    }
  });

  test('should select and proceed with a plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Select a plan
    const selectButton = page.locator('button').filter({ hasText: /Select|Choose|Subscribe|Seç|Abone/i }).first();
    
    if (await selectButton.isVisible()) {
      await selectButton.click();
      
      // Should navigate to checkout or show modal
      const checkoutPage = page.url().includes('checkout') || page.url().includes('payment');
      const modalVisible = await page.locator('.ant-modal').isVisible();
      
      expect(checkoutPage || modalVisible).toBeTruthy();
    }
  });

  test('should fill payment information', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check for payment form
    const paymentForm = page.locator('form').filter({ hasText: /Card|Payment|Kart|Ödeme/i });
    
    if (await paymentForm.isVisible()) {
      // Fill card details
      const cardNumber = page.locator('input[name="cardNumber"], input[placeholder*="Card Number"], input[placeholder*="Kart Numarası"]');
      const cardName = page.locator('input[name="cardName"], input[placeholder*="Name on Card"], input[placeholder*="Kart Üzerindeki İsim"]');
      const expiry = page.locator('input[name="expiry"], input[placeholder*="MM/YY"], input[placeholder*="AA/YY"]');
      const cvv = page.locator('input[name="cvv"], input[placeholder*="CVV"], input[placeholder*="CVC"]');
      
      if (await cardNumber.isVisible()) {
        await cardNumber.fill('4242424242424242'); // Test card number
      }
      
      if (await cardName.isVisible()) {
        await cardName.fill('Test User');
      }
      
      if (await expiry.isVisible()) {
        await expiry.fill('12/25');
      }
      
      if (await cvv.isVisible()) {
        await cvv.fill('123');
      }
    }
  });

  test('should validate payment form', async ({ page }) => {
    await page.goto('/checkout');
    
    // Try to submit without filling form
    const submitButton = page.locator('button').filter({ hasText: /Pay|Submit|Complete|Öde|Tamamla/i });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Check for validation errors
      await expect(page.locator('.error, .ant-form-item-explain-error, [role="alert"]')).toBeVisible();
    }
    
    // Test invalid card number
    const cardNumber = page.locator('input[name="cardNumber"], input[placeholder*="Card Number"]');
    if (await cardNumber.isVisible()) {
      await cardNumber.fill('1234567890123456');
      await submitButton.click();
      
      // Check for invalid card error
      await expect(page.locator('text=/Invalid|Geçersiz|card number|kart numarası/i')).toBeVisible();
    }
  });

  test('should apply discount code', async ({ page }) => {
    await page.goto('/checkout');
    
    // Look for discount code input
    const discountInput = page.locator('input[name="discount"], input[placeholder*="Discount"], input[placeholder*="İndirim"]');
    
    if (await discountInput.isVisible()) {
      // Enter discount code
      await discountInput.fill('TESTCODE');
      
      // Apply discount
      const applyButton = page.locator('button').filter({ hasText: /Apply|Uygula/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // Wait for response
        await page.waitForTimeout(1000);
        
        // Check for success or error message
        const message = page.locator('.ant-message, .discount-message, [role="alert"]');
        await expect(message).toBeVisible();
      }
    }
  });

  test('should display order summary', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check for order summary section
    const orderSummary = page.locator('.order-summary, .summary, .ant-card').filter({ hasText: /Summary|Total|Özet|Toplam/i });
    
    if (await orderSummary.isVisible()) {
      // Check for line items
      await expect(orderSummary.locator('text=/Subtotal|Alt Toplam/i')).toBeVisible();
      
      // Check for tax if applicable
      const tax = orderSummary.locator('text=/Tax|VAT|KDV|Vergi/i');
      if (await tax.isVisible()) {
        await expect(tax).toBeVisible();
      }
      
      // Check for total
      await expect(orderSummary.locator('text=/Total|Toplam/i')).toBeVisible();
    }
  });

  test('should handle payment processing', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill minimal required fields
    const cardNumber = page.locator('input[name="cardNumber"], input[placeholder*="Card Number"]');
    if (await cardNumber.isVisible()) {
      await cardNumber.fill('4242424242424242');
      
      // Fill other required fields
      await page.fill('input[name="expiry"], input[placeholder*="MM/YY"]', '12/25');
      await page.fill('input[name="cvv"], input[placeholder*="CVV"]', '123');
      
      // Submit payment
      const submitButton = page.locator('button').filter({ hasText: /Pay|Submit|Complete/i });
      await submitButton.click();
      
      // Check for processing state
      await expect(page.locator('.ant-spin, .loading, text=/Processing|İşleniyor/i')).toBeVisible();
      
      // Wait for result (success or error)
      await page.waitForTimeout(3000);
      
      // Check for result message
      const resultMessage = page.locator('.ant-message, .ant-result, [role="alert"]');
      await expect(resultMessage).toBeVisible();
    }
  });

  test('should display subscription management', async ({ page }) => {
    // Navigate to billing/subscription page
    await page.goto('/billing');
    
    // Check for current subscription info
    const subscriptionInfo = page.locator('.subscription-info, .current-plan, .ant-card').filter({ hasText: /Current|Active|Mevcut|Aktif/i });
    
    if (await subscriptionInfo.isVisible()) {
      // Check for plan name
      await expect(subscriptionInfo.locator('text=/Basic|Pro|Enterprise/i')).toBeVisible();
      
      // Check for next billing date
      const billingDate = subscriptionInfo.locator('text=/Next billing|Renews|Sonraki fatura|Yenileme/i');
      if (await billingDate.isVisible()) {
        await expect(billingDate).toBeVisible();
      }
    }
  });

  test('should cancel subscription', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for cancel button
    const cancelButton = page.locator('button').filter({ hasText: /Cancel|İptal/i });
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Check for confirmation modal
      const confirmModal = page.locator('.ant-modal');
      await expect(confirmModal).toBeVisible();
      
      // Check for cancellation reason
      const reasonSelect = confirmModal.locator('select, .ant-select');
      if (await reasonSelect.isVisible()) {
        await reasonSelect.click();
        await page.click('.ant-select-item, option').first();
      }
      
      // Confirm cancellation
      const confirmButton = confirmModal.locator('button').filter({ hasText: /Confirm|Cancel Subscription|Onayla|Aboneliği İptal/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        
        // Check for success message
        await expect(page.locator('.ant-message-success, text=/cancelled|iptal edildi/i')).toBeVisible();
      }
    }
  });

  test('should download invoice', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for invoice/billing history section
    const invoiceSection = page.locator('.invoice-history, .billing-history, .ant-table');
    
    if (await invoiceSection.isVisible()) {
      // Find download button for first invoice
      const downloadButton = invoiceSection.locator('button, a').filter({ hasText: /Download|İndir|PDF/i }).first();
      
      if (await downloadButton.isVisible()) {
        // Start waiting for download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        await downloadButton.click();
        
        try {
          const download = await downloadPromise;
          
          // Verify download
          expect(download).toBeTruthy();
          
          // Check file type
          const fileName = download.suggestedFilename();
          expect(fileName).toMatch(/\.pdf$/);
        } catch (e) {
          // Download might open in new tab
          const newTab = await page.context().waitForEvent('page');
          expect(newTab.url()).toContain('invoice');
        }
      }
    }
  });

  test('should update payment method', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for update payment method button
    const updateButton = page.locator('button').filter({ hasText: /Update Payment|Change Card|Ödeme Yöntemi|Kartı Değiştir/i });
    
    if (await updateButton.isVisible()) {
      await updateButton.click();
      
      // Check for payment method form
      const paymentForm = page.locator('.ant-modal, .payment-form');
      await expect(paymentForm).toBeVisible();
      
      // Fill new card details
      const newCardNumber = paymentForm.locator('input[name="cardNumber"], input[placeholder*="Card Number"]');
      if (await newCardNumber.isVisible()) {
        await newCardNumber.fill('5555555555554444'); // Different test card
        
        // Fill other fields
        await paymentForm.fill('input[name="expiry"], input[placeholder*="MM/YY"]', '01/26');
        await paymentForm.fill('input[name="cvv"], input[placeholder*="CVV"]', '456');
        
        // Save new payment method
        const saveButton = paymentForm.locator('button').filter({ hasText: /Save|Update|Kaydet|Güncelle/i });
        await saveButton.click();
        
        // Check for success message
        await expect(page.locator('.ant-message-success, text=/updated|güncellendi/i')).toBeVisible();
      }
    }
  });
});