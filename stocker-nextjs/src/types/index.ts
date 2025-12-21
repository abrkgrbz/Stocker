// Common types used across the application

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  identifier: string; // Maps to Code on backend (kept for backward compatibility)
  code: string; // Backend's Code field
  name: string;
  domain?: string;
  isActive: boolean;
  packageId?: string;
  createdAt: string;
  updatedAt?: string;
  subscription?: TenantSubscription;
}

export interface TenantSubscription {
  id: string;
  packageId?: string;
  packageName: string;
  status: string;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  price: number;
}

export interface Module {
  id: string;
  name: string; // Kept for backward compatibility
  moduleName: string;
  code: string; // Kept for backward compatibility
  moduleCode: string;
  description?: string;
  isActive: boolean; // Kept for backward compatibility
  isEnabled: boolean;
  order: number; // Kept for backward compatibility
  enabledDate?: string;
  disabledDate?: string;
  configuration?: string;
  userLimit?: number;
  storageLimit?: number;
  recordLimit?: number;
  expiryDate?: string;
  isTrial: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number; // Kept for backward compatibility (flattened from basePrice.amount)
  basePrice: MoneyDto;
  currency: string;
  type: string;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number; // In GB
  trialDays: number;
  features: PackageFeature[];
  modules: PackageModule[];
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface PackageFeature {
  featureCode: string;
  featureName: string;
  isEnabled: boolean;
}

export interface PackageModule {
  moduleCode: string;
  moduleName: string;
  isIncluded: boolean;
}

// Dashboard types
export interface DashboardSummary {
  company: CompanyInfo;
  subscription: DashboardSubscriptionInfo;
  modules: ModuleInfo[];
  quickStats: QuickStats;
  totalUsers: number;
  activeUsers: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
}

export interface CompanyInfo {
  name: string;
  logo: string;
  industry?: string;
  employeeCount: number;
  foundedYear: number;
}

export interface DashboardSubscriptionInfo {
  plan: string;
  status: string;
  expiryDate: string;
  usedStorage: number;
  totalStorage: number;
  usedUsers: number;
  totalUsers: number;
}

export interface ModuleInfo {
  name: string;
  status: string;
  usagePercentage: number;
}

export interface QuickStats {
  todayRevenue: number;
  todayOrders: number;
  pendingTasks: number;
  unreadMessages: number;
}

// Settings types
export interface Setting {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  category: string;
  dataType: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Auth types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
}
