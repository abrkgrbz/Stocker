import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly userMenu: Locator;
  readonly sideMenu: Locator;
  readonly statsCards: Locator;
  readonly revenueChart: Locator;
  readonly activityFeed: Locator;
  readonly notificationBell: Locator;
  readonly searchBar: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1, .page-title').first();
    this.userMenu = page.locator('.ant-dropdown-trigger, [data-testid="user-menu"]');
    this.sideMenu = page.locator('.ant-layout-sider, .sidebar');
    this.statsCards = page.locator('.stat-card, .ant-card');
    this.revenueChart = page.locator('.revenue-chart, .chart-container');
    this.activityFeed = page.locator('.activity-feed, .recent-activities');
    this.notificationBell = page.locator('.notification-bell, [data-testid="notifications"]');
    this.searchBar = page.locator('input[placeholder*="Search"], .ant-input-search');
    this.logoutButton = page.locator('button:has-text("Logout"), [data-testid="logout"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getUserName(): Promise<string> {
    await this.userMenu.waitFor({ state: 'visible' });
    return await this.userMenu.textContent() || '';
  }

  async navigateToSection(sectionName: string) {
    const menuItem = this.page.locator(`.ant-menu-item:has-text("${sectionName}"), .sidebar-item:has-text("${sectionName}")`);
    await menuItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getStatValue(statName: string): Promise<string> {
    const statCard = this.page.locator(`.stat-card:has-text("${statName}"), .ant-card:has-text("${statName}")`);
    const value = statCard.locator('.stat-value, .ant-statistic-content');
    return await value.textContent() || '0';
  }

  async searchFor(query: string) {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async openUserMenu() {
    await this.userMenu.click();
    await this.page.waitForSelector('.ant-dropdown-menu, .user-menu-dropdown');
  }

  async logout() {
    await this.openUserMenu();
    await this.page.locator('text=Logout').click();
    await this.page.waitForURL(/login/, { timeout: 5000 });
  }

  async openNotifications() {
    await this.notificationBell.click();
    await this.page.waitForSelector('.notification-panel, .ant-popover');
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.notificationBell.locator('.ant-badge-count, .notification-count');
    if (await badge.isVisible()) {
      const text = await badge.textContent() || '0';
      return parseInt(text, 10);
    }
    return 0;
  }

  async isMenuItemActive(itemName: string): Promise<boolean> {
    const menuItem = this.page.locator(`.ant-menu-item:has-text("${itemName}")`);
    const classes = await menuItem.getAttribute('class') || '';
    return classes.includes('ant-menu-item-selected') || classes.includes('active');
  }

  async expandSideMenu() {
    const trigger = this.page.locator('.ant-layout-sider-trigger, .sidebar-toggle');
    if (await trigger.isVisible()) {
      await trigger.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  async collapseSideMenu() {
    const trigger = this.page.locator('.ant-layout-sider-trigger, .sidebar-toggle');
    if (await trigger.isVisible()) {
      await trigger.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  async getRecentActivityCount(): Promise<number> {
    const items = this.activityFeed.locator('.activity-item, .ant-list-item');
    return await items.count();
  }

  async refreshDashboard() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async checkDataLoaded(): Promise<boolean> {
    // Check if stats cards have loaded
    const statsLoaded = await this.statsCards.first().isVisible();
    
    // Check if chart has loaded (might have skeleton loader)
    const chartLoaded = await this.revenueChart.isVisible();
    
    return statsLoaded && chartLoaded;
  }

  async waitForDataToLoad(timeout: number = 10000) {
    await this.page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll('.ant-skeleton, .skeleton-loader');
        const spinners = document.querySelectorAll('.ant-spin-spinning');
        return skeletons.length === 0 && spinners.length === 0;
      },
      { timeout }
    );
  }
}