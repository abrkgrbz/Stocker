import { apiClient } from '../client';
import type { ApiResponse } from '../types';

/**
 * Billing & Subscription Types
 */

export interface PlanDto {
  productId: string;
  productName: string;
  productDescription?: string;
  variantId: string;
  variantName: string;
  price: number;
  priceFormatted?: string;
  interval?: string;
  intervalCount?: number;
  isSubscription: boolean;
}

export interface SubscriptionDto {
  id: string;
  status: string;
  statusFormatted?: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  currency: string;
  billingInterval: string;
  renewsAt?: string;
  endsAt?: string;
  trialEndsAt?: string;
  isCancelled: boolean;
  isPaused: boolean;
  cardBrand?: string;
  cardLastFour?: string;
  customerPortalUrl?: string;
  updatePaymentMethodUrl?: string;
}

export interface PlansResponse {
  success: boolean;
  plans: PlanDto[];
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: SubscriptionDto;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl: string;
  checkoutId: string;
  expiresAt: string;
}

export interface PortalUrlResponse {
  success: boolean;
  portalUrl: string;
}

export interface CreateCheckoutRequest {
  variantId: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface ChangePlanRequest {
  newVariantId: string;
}

/**
 * Billing Service - Manages subscription and billing operations
 */
export class BillingService {
  private readonly basePath = '/api/billing';

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<ApiResponse<PlansResponse>> {
    return apiClient.get<PlansResponse>(`${this.basePath}/plans`);
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<ApiResponse<SubscriptionResponse>> {
    return apiClient.get<SubscriptionResponse>(`${this.basePath}/subscription`);
  }

  /**
   * Create checkout session
   */
  async createCheckout(request: CreateCheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    return apiClient.post<CheckoutResponse>(`${this.basePath}/checkout`, request);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`${this.basePath}/subscription/cancel`);
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`${this.basePath}/subscription/pause`);
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`${this.basePath}/subscription/resume`);
  }

  /**
   * Change subscription plan
   */
  async changePlan(request: ChangePlanRequest): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`${this.basePath}/subscription/change-plan`, request);
  }

  /**
   * Get customer portal URL
   */
  async getCustomerPortal(): Promise<ApiResponse<PortalUrlResponse>> {
    return apiClient.get<PortalUrlResponse>(`${this.basePath}/portal`);
  }
}

export const billingService = new BillingService();
