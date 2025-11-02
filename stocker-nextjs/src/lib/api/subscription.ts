/**
 * Subscription API Service
 * Handles tenant subscription and package limit operations
 */

import { apiClient } from './client';

export interface SubscriptionInfo {
  subscriptionId: string;
  packageName: string;
  packageType: string;
  currentUserCount: number;
  maxUsers: number;
  canAddUser: boolean;
  maxStorage: number;
  maxProjects: number;
  status: string;
  currentPeriodEnd: string;
  isTrialActive: boolean;
  trialEndDate?: string;
}

/**
 * Get tenant subscription information including user limits
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  const response = await apiClient.get<{ success: boolean; data: SubscriptionInfo; message: string }>(
    '/api/tenant/users/subscription-info'
  );
  return response.data;
}
