/**
 * Create Tenant Use Case
 * Business logic for creating a new tenant
 */

import { Tenant, ITenantUser, ITenantBilling, ITenantSettings } from '../../entities/Tenant';
import { ITenantRepository } from '../../repositories/ITenantRepository';
import { STATUS } from '../../../../constants';

export interface ICreateTenantDTO {
  name: string;
  subdomain: string;
  ownerEmail: string;
  ownerName: string;
  plan: 'starter' | 'professional' | 'enterprise';
  isTrialAccount?: boolean;
}

export interface ICreateTenantResult {
  success: boolean;
  tenant?: Tenant;
  error?: string;
}

/**
 * Use case for creating a new tenant
 */
export class CreateTenantUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository
  ) {}

  async execute(data: ICreateTenantDTO): Promise<ICreateTenantResult> {
    try {
      // Validate input
      const validation = this.validateInput(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check subdomain availability
      const isAvailable = await this.tenantRepository.isSubdomainAvailable(data.subdomain);
      if (!isAvailable) {
        return {
          success: false,
          error: 'Subdomain is already taken'
        };
      }

      // Create owner user
      const owner: ITenantUser = {
        id: this.generateId(),
        email: data.ownerEmail,
        name: data.ownerName,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      };

      // Create billing info
      const billing: ITenantBilling = {
        plan: data.plan,
        status: 'active',
        currentPeriodEnd: this.calculatePeriodEnd(data.isTrialAccount),
        monthlyRevenue: this.getPlanPrice(data.plan)
      };

      // Create default settings
      const settings: ITenantSettings = {
        timezone: 'Europe/Istanbul',
        language: 'tr',
        dateFormat: 'DD/MM/YYYY',
        currency: 'TRY',
        features: this.getDefaultFeatures(data.plan)
      };

      // Create tenant entity
      const tenant = new Tenant(
        this.generateId(),
        data.name,
        data.subdomain.toLowerCase(),
        data.isTrialAccount ? STATUS.TRIAL : STATUS.ACTIVE,
        data.plan,
        [owner],
        billing,
        settings,
        new Date(),
        new Date()
      );

      // Save to repository
      const savedTenant = await this.tenantRepository.create(tenant);

      // Additional setup (could be async/queued)
      await this.performPostCreationSetup(savedTenant);

      return {
        success: true,
        tenant: savedTenant
      };

    } catch (error: any) {
      console.error('CreateTenantUseCase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tenant'
      };
    }
  }

  /**
   * Validate input data
   */
  private validateInput(data: ICreateTenantDTO): { isValid: boolean; error?: string } {
    // Name validation
    if (!data.name || data.name.length < 3) {
      return { isValid: false, error: 'Tenant name must be at least 3 characters' };
    }

    // Subdomain validation
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!subdomainRegex.test(data.subdomain.toLowerCase())) {
      return { isValid: false, error: 'Invalid subdomain format' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.ownerEmail)) {
      return { isValid: false, error: 'Invalid email address' };
    }

    // Plan validation
    const validPlans = ['starter', 'professional', 'enterprise'];
    if (!validPlans.includes(data.plan)) {
      return { isValid: false, error: 'Invalid plan selected' };
    }

    return { isValid: true };
  }

  /**
   * Calculate billing period end date
   */
  private calculatePeriodEnd(isTrial?: boolean): Date {
    const date = new Date();
    if (isTrial) {
      date.setDate(date.getDate() + 14); // 14 days trial
    } else {
      date.setMonth(date.getMonth() + 1); // 1 month subscription
    }
    return date;
  }

  /**
   * Get plan price
   */
  private getPlanPrice(plan: string): number {
    switch (plan) {
      case 'starter':
        return 29;
      case 'professional':
        return 99;
      case 'enterprise':
        return 299;
      default:
        return 0;
    }
  }

  /**
   * Get default features for plan
   */
  private getDefaultFeatures(plan: string): Record<string, boolean> {
    const baseFeatures = {
      dashboard: true,
      users: true,
      reports: true,
      api: false,
      webhooks: false,
      customDomain: false,
      sso: false,
      audit: false,
      backup: false,
    };

    switch (plan) {
      case 'starter':
        return baseFeatures;
      case 'professional':
        return {
          ...baseFeatures,
          api: true,
          webhooks: true,
          audit: true,
        };
      case 'enterprise':
        return {
          ...baseFeatures,
          api: true,
          webhooks: true,
          customDomain: true,
          sso: true,
          audit: true,
          backup: true,
        };
      default:
        return baseFeatures;
    }
  }

  /**
   * Perform post-creation setup
   */
  private async performPostCreationSetup(tenant: Tenant): Promise<void> {
    // This could include:
    // - Creating database/schema for tenant
    // - Setting up default data
    // - Sending welcome email
    // - Creating API keys
    // - Setting up webhooks
    
    // For now, just log
    console.log(`Post-creation setup for tenant ${tenant.id} completed`);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}