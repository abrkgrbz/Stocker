import { apiClient } from './apiClient';

// Subscription DTOs matching backend
export interface SubscriptionDto {
  id: string;
  tenantId: string;
  packageId: string;
  subscriptionNumber: string;
  tenantName: string;
  packageName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  price: number;
  currency: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndDate?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  autoRenew: boolean;
  userCount: number;
  modules: SubscriptionModuleDto[];
  usages: SubscriptionUsageDto[];
}

export interface SubscriptionModuleDto {
  id: string;
  subscriptionId: string;
  moduleCode: string;
  moduleName: string;
  maxEntities?: number;
  isActive: boolean;
}

export interface SubscriptionUsageDto {
  id: string;
  subscriptionId: string;
  metricName: string;
  value: number;
  recordedAt: string;
}

export enum SubscriptionStatus {
  Deneme = 0,
  Aktif = 1,
  Askida = 2,
  Iptal = 3,
  Suresi_Dolmus = 4
}

export enum BillingCycle {
  Aylik = 0,
  Yillik = 1,
  Tek_Sefer = 2
}

export interface GetSubscriptionsQuery {
  tenantId?: string;
  status?: SubscriptionStatus;
  autoRenew?: boolean;
}

export interface CreateSubscriptionCommand {
  tenantId: string;
  packageId: string;
  billingCycle: BillingCycle;
  startDate: string;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionCommand {
  id?: string;
  packageId?: string;
  billingCycle?: BillingCycle;
  autoRenew?: boolean;
}

export interface CancelSubscriptionCommand {
  id: string;
  reason: string;
}

export interface RenewSubscriptionCommand {
  id: string;
  newPackageId?: string;
}

export interface ChangePackageCommand {
  newPackageId: string;
}

class SubscriptionService {
  private readonly basePath = '/api/master/subscriptions';

  /**
   * Get all subscriptions with filtering
   */
  async getAll(query?: GetSubscriptionsQuery): Promise<SubscriptionDto[]> {
    try {
      const params = new URLSearchParams();

      if (query) {
        if (query.tenantId) params.append('tenantId', query.tenantId);
        if (query.status !== undefined) params.append('status', query.status.toString());
        if (query.autoRenew !== undefined) params.append('autoRenew', query.autoRenew.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

      return await apiClient.get<SubscriptionDto[]>(url);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getById(id: string): Promise<SubscriptionDto | null> {
    try {
      return await apiClient.get<SubscriptionDto>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch subscription ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new subscription
   */
  async create(command: CreateSubscriptionCommand): Promise<SubscriptionDto> {
    try {
      return await apiClient.post<SubscriptionDto>(this.basePath, command);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async update(id: string, command: UpdateSubscriptionCommand): Promise<boolean> {
    try {
      const response = await apiClient.put<boolean>(`${this.basePath}/${id}`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to update subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancel(id: string, command: CancelSubscriptionCommand): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${id}/cancel`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to cancel subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Renew a subscription
   */
  async renew(id: string, command: RenewSubscriptionCommand): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${id}/renew`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to renew subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Change subscription package for a tenant
   */
  async changePackage(tenantId: string, command: ChangePackageCommand): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(
        `${this.basePath}/tenant/${tenantId}/change-package`,
        command
      );
      return response === true;
    } catch (error) {
      console.error(`Failed to change package for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Get status color for UI
   */
  getStatusColor(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.Deneme:
        return 'processing';
      case SubscriptionStatus.Aktif:
        return 'success';
      case SubscriptionStatus.Askida:
        return 'warning';
      case SubscriptionStatus.Iptal:
        return 'default';
      case SubscriptionStatus.Suresi_Dolmus:
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Helper: Get status display text
   */
  getStatusText(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.Deneme:
        return 'Deneme';
      case SubscriptionStatus.Aktif:
        return 'Aktif';
      case SubscriptionStatus.Askida:
        return 'Askıda';
      case SubscriptionStatus.Iptal:
        return 'İptal';
      case SubscriptionStatus.Suresi_Dolmus:
        return 'Süresi Dolmuş';
      default:
        return 'Bilinmiyor';
    }
  }

  /**
   * Helper: Get billing cycle display text
   */
  getBillingCycleText(cycle: BillingCycle): string {
    switch (cycle) {
      case BillingCycle.Aylik:
        return 'Aylık';
      case BillingCycle.Yillik:
        return 'Yıllık';
      case BillingCycle.Tek_Sefer:
        return 'Tek Sefer';
      default:
        return 'Bilinmiyor';
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
