import { apiClient } from '../client';
import type { ApiResponse } from '../types';

/**
 * Billing & Subscription Types
 */

export type PaymentGateway = 'lemonsqueezy' | 'iyzico';

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

// Iyzico specific types
export interface IyzicoCheckoutRequest {
  packageId: string;
  customerName?: string;
  customerPhone?: string;
  callbackUrl?: string;
  enableInstallment?: boolean;
  billingAddress?: IyzicoBillingAddress;
}

export interface IyzicoBillingAddress {
  contactName: string;
  city: string;
  country?: string;
  address: string;
  zipCode?: string;
}

export interface IyzicoCheckoutResponse {
  success: boolean;
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
  tokenExpireTime: number;
}

export interface IyzicoPaymentResult {
  success: boolean;
  paymentId?: string;
  paidPrice?: number;
  currency?: string;
  installment?: number;
  cardAssociation?: string;
  cardFamily?: string;
  lastFourDigits?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IyzicoInstallmentOption {
  installmentNumber: number;
  totalPrice: number;
  installmentPrice: number;
}

export interface IyzicoInstallmentResponse {
  success: boolean;
  binNumber: string;
  cardAssociation?: string;
  cardFamily?: string;
  bankName?: string;
  installmentOptions: IyzicoInstallmentOption[];
}

export interface PaymentGatewayInfo {
  gateway: PaymentGateway;
  supportedCurrencies: string[];
  supportsInstallment: boolean;
  supports3DSecure: boolean;
}

// Module & Bundle Pricing Types
export interface ModulePricingItem {
  id: string;
  moduleCode: string;
  moduleName: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isCore: boolean;
  trialDays?: number;
  displayOrder: number;
  includedFeatures: string[];
}

export interface ModuleBundleItem {
  id: string;
  bundleCode: string;
  bundleName: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  discountPercent: number;
  displayOrder: number;
  moduleCodes: string[];
  originalMonthlyPrice: number;
  savingsAmount: number;
}

export interface AddOnItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: string;
  displayOrder: number;
  category?: string;
  requiredModuleCode?: string;
  quantity?: number;
  quantityUnit?: string;
  features: string[];
}

export interface ModulePricingListResponse {
  success: boolean;
  modules: ModulePricingItem[];
}

export interface ModuleBundleListResponse {
  success: boolean;
  bundles: ModuleBundleItem[];
}

export interface AddOnListResponse {
  success: boolean;
  addOns: AddOnItem[];
}

export interface FullPricingResponse {
  success: boolean;
  modules: ModulePricingItem[];
  bundles: ModuleBundleItem[];
  addOns: AddOnItem[];
}

export interface PriceLineItem {
  code: string;
  name: string;
  type: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CalculatePriceRequest {
  packageId?: string;
  bundleCode?: string;
  moduleCodes?: string[];
  addOnCodes?: string[];
  userCount: number;
  billingCycle?: 'monthly' | 'yearly';
}

export interface PriceCalculationResponse {
  success: boolean;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  billingCycle: string;
  basePackagePrice: number;
  modulesPrice: number;
  bundlePrice: number;
  addOnsPrice: number;
  userPrice: number;
  includedUsers: number;
  additionalUsers: number;
  pricePerAdditionalUser: number;
  lineItems: PriceLineItem[];
}

/**
 * Billing Service - Manages subscription and billing operations
 * Uses tenant-scoped endpoints (/api/tenant/billing) for proper tenant resolution
 */
export class BillingService {
  private readonly basePath = '/api/tenant/billing';

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

  // ==========================================
  // Iyzico Payment Methods (Turkish payments)
  // ==========================================

  /**
   * Get preferred payment gateway based on currency
   */
  async getPaymentGateway(currency?: string): Promise<ApiResponse<PaymentGatewayInfo>> {
    const params = currency ? `?currency=${currency}` : '';
    return apiClient.get<PaymentGatewayInfo>(`${this.basePath}/payment-gateway${params}`);
  }

  /**
   * Create Iyzico checkout form for Turkish payments
   */
  async createIyzicoCheckout(request: IyzicoCheckoutRequest): Promise<ApiResponse<IyzicoCheckoutResponse>> {
    return apiClient.post<IyzicoCheckoutResponse>(`${this.basePath}/iyzico/checkout`, request);
  }

  /**
   * Get Iyzico checkout result after 3D Secure callback
   */
  async getIyzicoCheckoutResult(token: string): Promise<ApiResponse<IyzicoPaymentResult>> {
    return apiClient.get<IyzicoPaymentResult>(`${this.basePath}/iyzico/checkout-result?token=${token}`);
  }

  /**
   * Get Iyzico installment options for a card
   */
  async getIyzicoInstallments(binNumber: string, price: number): Promise<ApiResponse<IyzicoInstallmentResponse>> {
    return apiClient.get<IyzicoInstallmentResponse>(
      `${this.basePath}/iyzico/installments?binNumber=${binNumber}&price=${price}`
    );
  }

  // ==========================================
  // Module & Bundle Pricing Methods
  // ==========================================

  /**
   * Get all module pricings
   */
  async getModulePricings(): Promise<ApiResponse<ModulePricingListResponse>> {
    return apiClient.get<ModulePricingListResponse>(`${this.basePath}/modules`);
  }

  /**
   * Get all module bundles
   */
  async getModuleBundles(): Promise<ApiResponse<ModuleBundleListResponse>> {
    return apiClient.get<ModuleBundleListResponse>(`${this.basePath}/bundles`);
  }

  /**
   * Get all add-ons, optionally filtered by module
   */
  async getAddOns(moduleCode?: string): Promise<ApiResponse<AddOnListResponse>> {
    const params = moduleCode ? `?moduleCode=${moduleCode}` : '';
    return apiClient.get<AddOnListResponse>(`${this.basePath}/addons${params}`);
  }

  /**
   * Get full pricing information (modules, bundles, and add-ons)
   */
  async getFullPricing(): Promise<ApiResponse<FullPricingResponse>> {
    return apiClient.get<FullPricingResponse>(`${this.basePath}/pricing`);
  }

  /**
   * Calculate subscription price preview
   */
  async calculatePrice(request: CalculatePriceRequest): Promise<ApiResponse<PriceCalculationResponse>> {
    return apiClient.post<PriceCalculationResponse>(`${this.basePath}/calculate-price`, request);
  }
}

export const billingService = new BillingService();
