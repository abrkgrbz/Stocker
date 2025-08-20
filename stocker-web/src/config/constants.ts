export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://95.217.219.4:5000';
export const APP_NAME = 'Stocker';
export const TOKEN_KEY = 'stocker_token';
export const REFRESH_TOKEN_KEY = 'stocker_refresh_token';
export const TENANT_KEY = 'stocker_tenant';

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TENANTS: '/admin/tenants',
  ADMIN_PACKAGES: '/admin/packages',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Tenant routes
  TENANT_DASHBOARD: '/app/:tenantId',
  TENANT_CRM: '/app/:tenantId/crm',
  TENANT_INVENTORY: '/app/:tenantId/inventory',
  TENANT_USERS: '/app/:tenantId/users',
  TENANT_SETTINGS: '/app/:tenantId/settings',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TENANT_ADMIN: 'TenantAdmin',
  USER: 'User',
} as const;