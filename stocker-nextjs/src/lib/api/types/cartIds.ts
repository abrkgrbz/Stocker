
export type BillingCycle = 'Monthly' | 'Yearly';
export type Currency = 'TRY' | 'USD' | 'EUR';
export type CartStatus = 'Active' | 'CheckingOut' | 'Completed' | 'Abandoned' | 'Expired';
export type CartItemType = 'Module' | 'Bundle' | 'AddOn' | 'StoragePlan' | 'Users';
export type OrderStatus = 'Pending' | 'PaymentProcessing' | 'PaymentCompleted' | 'PaymentFailed' | 'Activating' | 'Completed' | 'Cancelled' | 'RefundRequested' | 'Refunded';

export interface CartItemDto {
    id: string;
    itemType: CartItemType;
    itemTypeDisplay: string;
    itemCode: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    currency: Currency;
    // Metadata properties
    trialDays?: number;
    discountPercent?: number;
    includedModuleCodes?: string[];
    requiredModuleCode?: string;
    storageGB?: number;
}

export interface CartDto {
    id: string;
    tenantId: string;
    status: CartStatus;
    statusDisplay: string;
    billingCycle: BillingCycle;
    billingCycleDisplay: string;
    subTotal: number;
    discountTotal: number;
    total: number;
    currency: Currency;
    couponCode?: string;
    discountPercent?: number;
    itemCount: number;
    createdAt: string;
    expiresAt?: string;
    items: CartItemDto[];
}

export interface CreateCartRequest {
    billingCycle: BillingCycle;
    currency: Currency;
}

export interface AddModuleRequest {
    moduleCode: string;
}

export interface AddBundleRequest {
    bundleCode: string;
}

export interface AddAddOnRequest {
    addOnCode: string;
    quantity: number;
}

export interface UpdateQuantityRequest {
    quantity: number;
}

export interface BillingAddressDto {
    name: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    taxId?: string;
}

export interface CheckoutRequest {
    billingAddress: BillingAddressDto;
    callbackUrl: string;
}

export interface CheckoutResponse {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: Currency;
    checkoutFormContent: string;
    checkoutPageUrl?: string;
    paymentToken: string;
}

export interface OrderItemDto {
    itemCode: string;
    itemName: string;
    isActivated: boolean;
    activatedAt?: string;
}

export interface OrderDto {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subscriptionId?: string;
    items: OrderItemDto[];
}
