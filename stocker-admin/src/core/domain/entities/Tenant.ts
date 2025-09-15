/**
 * Tenant Domain Entity
 * Core business logic and rules for Tenant
 */

import { STATUS } from '../../../constants';

export interface ITenantUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ITenantBilling {
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: Date;
  monthlyRevenue: number;
}

export interface ITenantSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  features: Record<string, boolean>;
}

export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public subdomain: string,
    public status: typeof STATUS[keyof typeof STATUS],
    public plan: string,
    public users: ITenantUser[],
    public billing: ITenantBilling,
    public settings: ITenantSettings,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // Business rules
  
  /**
   * Check if tenant can add more users
   */
  canAddUser(): boolean {
    const maxUsers = this.getMaxUsers();
    return this.users.filter(u => u.isActive).length < maxUsers;
  }

  /**
   * Get maximum allowed users based on plan
   */
  getMaxUsers(): number {
    switch (this.billing.plan) {
      case 'starter':
        return 10;
      case 'professional':
        return 50;
      case 'enterprise':
        return 500;
      default:
        return 10;
    }
  }

  /**
   * Check if tenant is active
   */
  isActive(): boolean {
    return this.status === STATUS.ACTIVE && 
           this.billing.status === 'active';
  }

  /**
   * Check if tenant is in trial period
   */
  isInTrial(): boolean {
    return this.status === STATUS.TRIAL;
  }

  /**
   * Check if tenant subscription is expired
   */
  isExpired(): boolean {
    return this.billing.currentPeriodEnd < new Date();
  }

  /**
   * Calculate storage usage percentage
   */
  getStorageUsagePercentage(currentUsageGB: number): number {
    const maxStorage = this.getMaxStorageGB();
    return (currentUsageGB / maxStorage) * 100;
  }

  /**
   * Get maximum storage in GB based on plan
   */
  getMaxStorageGB(): number {
    switch (this.billing.plan) {
      case 'starter':
        return 10;
      case 'professional':
        return 50;
      case 'enterprise':
        return 500;
      default:
        return 10;
    }
  }

  /**
   * Activate tenant
   */
  activate(): void {
    if (this.status === STATUS.SUSPENDED || this.status === STATUS.INACTIVE) {
      this.status = STATUS.ACTIVE;
      this.updatedAt = new Date();
    }
  }

  /**
   * Suspend tenant
   */
  suspend(reason?: string): void {
    if (this.status === STATUS.ACTIVE) {
      this.status = STATUS.SUSPENDED;
      this.updatedAt = new Date();
    }
  }

  /**
   * Add a new user to tenant
   */
  addUser(user: ITenantUser): void {
    if (!this.canAddUser()) {
      throw new Error('User limit reached for current plan');
    }
    this.users.push(user);
    this.updatedAt = new Date();
  }

  /**
   * Remove a user from tenant
   */
  removeUser(userId: string): void {
    const index = this.users.findIndex(u => u.id === userId);
    if (index > -1) {
      this.users.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Update tenant settings
   */
  updateSettings(settings: Partial<ITenantSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.updatedAt = new Date();
  }

  /**
   * Upgrade or downgrade plan
   */
  changePlan(newPlan: ITenantBilling['plan']): void {
    const currentUserCount = this.users.filter(u => u.isActive).length;
    const newMaxUsers = this.getMaxUsersForPlan(newPlan);
    
    if (currentUserCount > newMaxUsers) {
      throw new Error(`Cannot downgrade: Current user count (${currentUserCount}) exceeds new plan limit (${newMaxUsers})`);
    }
    
    this.billing.plan = newPlan;
    this.updatedAt = new Date();
  }

  /**
   * Helper to get max users for a specific plan
   */
  private getMaxUsersForPlan(plan: ITenantBilling['plan']): number {
    switch (plan) {
      case 'starter':
        return 10;
      case 'professional':
        return 50;
      case 'enterprise':
        return 500;
      default:
        return 10;
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      subdomain: this.subdomain,
      status: this.status,
      plan: this.plan,
      users: this.users,
      billing: this.billing,
      settings: this.settings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Computed properties
      isActive: this.isActive(),
      isInTrial: this.isInTrial(),
      isExpired: this.isExpired(),
      userCount: this.users.filter(u => u.isActive).length,
      maxUsers: this.getMaxUsers(),
    };
  }

  /**
   * Create Tenant from plain object
   */
  static fromJSON(data: any): Tenant {
    return new Tenant(
      data.id,
      data.name,
      data.subdomain,
      data.status,
      data.plan,
      data.users || [],
      data.billing,
      data.settings,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}