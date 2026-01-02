// Billing Types for LemonSqueezy Integration

export interface SubscriptionInfo {
    id: string;
    status: SubscriptionStatus;
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

export type SubscriptionStatus =
    | 'trial'
    | 'active'
    | 'cancelled'
    | 'paused'
    | 'past_due'
    | 'unpaid'
    | 'expired';

export interface Plan {
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

export interface PlansResponse {
    success: boolean;
    plans: Plan[];
}

export interface SubscriptionResponse {
    success: boolean;
    subscription?: SubscriptionInfo;
    error?: string;
}

export interface CheckoutRequest {
    variantId: string;
    customerName?: string;
    successUrl?: string;
    cancelUrl?: string;
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

export interface BillingApiError {
    success: false;
    error: string;
}

// Trial specific types
export interface TrialInfo {
    isInTrial: boolean;
    daysRemaining: number;
    trialEndDate?: string;
}
