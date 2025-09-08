export type PackageStatus = 'active' | 'inactive' | 'deprecated';

export type BillingCycle = 'monthly' | 'yearly';

export type PackageType = 'starter' | 'professional' | 'enterprise' | 'custom';

export interface PackageFeature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  limit?: number | 'unlimited';
  type: 'boolean' | 'limit' | 'module';
}

export interface PackagePricing {
  monthly: number;
  yearly: number;
  currency: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  setupFee?: number;
}

export interface PackageLimits {
  maxUsers: number | 'unlimited';
  storageGB: number | 'unlimited';
  apiRequestsPerMonth: number | 'unlimited';
  maxProjects?: number | 'unlimited';
  maxWorkspaces?: number | 'unlimited';
  supportLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
}

export interface PackageSettings {
  isPopular: boolean;
  isRecommended: boolean;
  displayOrder: number;
  customBadge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  trialDays: number;
  allowDowngrade: boolean;
  allowUpgrade: boolean;
  requiresApproval: boolean;
}

export interface PackageModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  required: boolean;
  features?: PackageFeature[];
}

export interface PackageStats {
  totalSubscribers: number;
  activeSubscribers: number;
  trialSubscribers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageLifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  growthRate: number;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  type: PackageType;
  description: string;
  shortDescription?: string;
  status: PackageStatus;
  
  // Pricing
  pricing: PackagePricing;
  
  // Limits and quotas
  limits: PackageLimits;
  
  // Features and modules
  features: PackageFeature[];
  modules: PackageModule[];
  
  // Settings
  settings: PackageSettings;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Statistics
  stats: PackageStats;
}

export interface CreatePackageRequest {
  name: string;
  slug: string;
  type: PackageType;
  description: string;
  shortDescription?: string;
  pricing: PackagePricing;
  limits: PackageLimits;
  features: Omit<PackageFeature, 'id'>[];
  modules: Omit<PackageModule, 'id'>[];
  settings: PackageSettings;
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  shortDescription?: string;
  status?: PackageStatus;
  pricing?: Partial<PackagePricing>;
  limits?: Partial<PackageLimits>;
  features?: PackageFeature[];
  modules?: PackageModule[];
  settings?: Partial<PackageSettings>;
}

export interface PackageFilters {
  status?: PackageStatus[];
  type?: PackageType[];
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface PackageListResponse {
  data: Package[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkPackageAction {
  action: 'activate' | 'deactivate' | 'deprecate' | 'delete';
  packageIds: string[];
  params?: {
    reason?: string;
  };
}

export interface PackageComparison {
  packages: Package[];
  features: {
    category: string;
    items: {
      name: string;
      description?: string;
      values: Record<string, boolean | string | number>;
    }[];
  }[];
}

export interface PackageMigration {
  fromPackageId: string;
  toPackageId: string;
  migrationPath: {
    id: string;
    name: string;
    description: string;
    autoMigration: boolean;
    requiresApproval: boolean;
    priceDifference: number;
    prorationPolicy: 'immediate' | 'next_cycle' | 'custom';
    steps: string[];
  };
}

export interface PackageAnalytics {
  packageId: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  data: {
    date: string;
    newSubscriptions: number;
    cancellations: number;
    revenue: number;
    activeUsers: number;
    trialConversions: number;
    upgrades: number;
    downgrades: number;
  }[];
}