import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly twoFactorInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    this.rememberMeCheckbox = page.locator('input[type="checkbox"][name="remember"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    this.errorMessage = page.locator('.ant-message-error, .error-message, [role="alert"]');
    this.loadingSpinner = page.locator('.ant-spin, .loading-spinner');
    this.twoFactorInput = page.locator('input[name="totp"], input[name="2fa"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
  }

  async loginWithEnter(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  async enterTwoFactorCode(code: string) {
    await this.twoFactorInput.waitFor({ state: 'visible' });
    await this.twoFactorInput.fill(code);
    await this.twoFactorInput.press('Enter');
  }

  async waitForLoginSuccess() {
    await this.page.waitForURL(/dashboard|home/, { timeout: 10000 });
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('dashboard') || url.includes('home');
  }

  async logout() {
    // Try multiple logout methods
    const logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try via user menu
      const userMenu = this.page.locator('.ant-dropdown-trigger, [data-testid="user-menu"]');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await this.page.locator('text=Logout').click();
      }
    }
    
    await this.page.waitForURL(/login/, { timeout: 5000 });
  }

  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    
    const isChecked = await this.rememberMeCheckbox.isChecked();
    if (isChecked) {
      await this.rememberMeCheckbox.uncheck();
    }
  }

  async isFormValid(): Promise<boolean> {
    const emailValue = await this.emailInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(emailValue);
    const isPasswordValid = passwordValue.length >= 8;
    
    return isEmailValid && isPasswordValid;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await this.emailInput.waitFor({ state: 'visible' });
  }
}