export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired';

export type TenantPlan = 'starter' | 'professional' | 'enterprise';

export interface TenantBilling {
  subscriptionId: string;
  nextBillingDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentMethod: string;
  billingAddress: {
    company: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    taxNumber?: string;
  };
}

export interface TenantLimits {
  maxUsers: number;
  currentUsers: number;
  storageQuotaGB: number;
  currentStorageGB: number;
  apiRequestsPerMonth: number;
  currentApiRequests: number;
}

export interface TenantSettings {
  customDomain?: string;
  customLogo?: string;
  customTheme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  features: string[];
  integrations: string[];
}

export interface TenantApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface TenantActivity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  status: TenantStatus;
  plan: TenantPlan;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  
  // Owner information
  ownerName: string;
  ownerEmail: string;
  
  // Billing
  billing: TenantBilling;
  
  // Limits and usage
  limits: TenantLimits;
  
  // Settings
  settings: TenantSettings;
  
  // API Keys
  apiKeys: TenantApiKey[];
  
  // Recent activities
  recentActivities: TenantActivity[];
  
  // Statistics
  stats: {
    totalUsers: number;
    activeUsers: number;
    storageUsed: number;
    apiCallsThisMonth: number;
    revenue: number;
  };
}

export interface TenantFilters {
  status?: TenantStatus[];
  plan?: TenantPlan[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  plan: TenantPlan;
  billing: Omit<TenantBilling, 'subscriptionId'>;
  limits: Omit<TenantLimits, 'currentUsers' | 'currentStorageGB' | 'currentApiRequests'>;
  settings?: Partial<TenantSettings>;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  billing?: Partial<TenantBilling>;
  limits?: Partial<TenantLimits>;
  settings?: Partial<TenantSettings>;
}

export interface TenantListResponse {
  data: Tenant[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkTenantAction {
  action: 'activate' | 'suspend' | 'delete' | 'change_plan';
  tenantIds: string[];
  params?: {
    newPlan?: TenantPlan;
    reason?: string;
  };
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  expiredTenants: number;
  totalRevenue: number;
  averageUsersPerTenant: number;
  totalStorageUsed: number;
  planDistribution: {
    starter: number;
    professional: number;
    enterprise: number;
  };
}