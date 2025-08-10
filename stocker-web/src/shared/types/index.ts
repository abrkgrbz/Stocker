// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  tenantId?: string;
  tenantName?: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
  user: User;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  code: string;
  domain?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  isActive: boolean;
  subscriptionStatus?: string;
  userCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTenantRequest {
  name: string;
  code: string;
  domain?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

// Package Types
export interface Package {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  billingCycle: BillingCycle;
  maxUsers: number;
  maxStorage?: number;
  features: PackageFeature[];
  modules: PackageModule[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt: string;
}

export interface PackageFeature {
  id: string;
  name: string;
  description?: string;
  isIncluded: boolean;
}

export interface PackageModule {
  id: string;
  moduleCode: string;
  moduleName: string;
  maxEntities?: number;
  isActive: boolean;
}

// Subscription Types
export const BillingCycle = {
  Monthly: 0,
  Quarterly: 1,
  SemiAnnually: 2,
  Annually: 3,
} as const;

export type BillingCycle = typeof BillingCycle[keyof typeof BillingCycle];

export const SubscriptionStatus = {
  Trial: 'Trial',
  Active: 'Active',
  PastDue: 'PastDue',
  Suspended: 'Suspended',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  packageId: string;
  packageName: string;
  subscriptionNumber: string;
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
  modules: SubscriptionModule[];
}

export interface SubscriptionModule {
  id: string;
  moduleCode: string;
  moduleName: string;
  maxEntities?: number;
  isActive: boolean;
}

export interface CreateSubscriptionRequest {
  tenantId: string;
  packageId: string;
  billingCycle: BillingCycle;
  customPrice?: number;
  currency?: string;
  startDate?: string;
  trialDays?: number;
  autoRenew?: boolean;
  userCount?: number;
}

// CRM Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  type: 'Lead' | 'Customer' | 'Vendor' | 'Partner';
  status: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  contactId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  subject: string;
  description?: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
  dueDate?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
}