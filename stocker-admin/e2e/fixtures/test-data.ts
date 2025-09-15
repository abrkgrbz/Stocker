/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!@#',
    name: 'Test Admin',
    role: 'admin'
  },
  tenant: {
    email: 'tenant@test.com',
    password: 'Tenant123!@#',
    name: 'Test Tenant',
    role: 'tenant'
  },
  user: {
    email: 'user@test.com',
    password: 'User123!@#',
    name: 'Test User',
    role: 'user'
  }
};

export const testTenants = {
  valid: {
    name: 'Test Company',
    subdomain: 'testcompany',
    email: 'contact@testcompany.com',
    phone: '+1234567890',
    address: '123 Test Street',
    plan: 'professional',
    maxUsers: 50
  },
  trial: {
    name: 'Trial Company',
    subdomain: 'trialcompany',
    email: 'trial@company.com',
    phone: '+0987654321',
    address: '456 Trial Avenue',
    plan: 'trial',
    maxUsers: 5
  }
};

export const testPackages = {
  basic: {
    name: 'Basic Plan',
    price: 29,
    features: ['5 Users', '10GB Storage', 'Basic Support'],
    isActive: true
  },
  professional: {
    name: 'Professional Plan',
    price: 99,
    features: ['50 Users', '100GB Storage', '24/7 Support', 'API Access'],
    isActive: true
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 299,
    features: ['Unlimited Users', 'Unlimited Storage', 'Dedicated Support', 'Custom Features'],
    isActive: true
  }
};

export const testSettings = {
  general: {
    siteName: 'Stocker Admin Test',
    siteUrl: 'http://localhost:5173',
    adminEmail: 'admin@stocker.test',
    timezone: 'UTC',
    language: 'en'
  },
  email: {
    smtpHost: 'smtp.test.com',
    smtpPort: 587,
    smtpUser: 'test@smtp.com',
    smtpSecure: true,
    emailFrom: 'noreply@stocker.test'
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    lockoutDuration: 900,
    twoFactorEnabled: false
  }
};

export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    verify: '/api/auth/verify'
  },
  tenants: {
    list: '/api/tenants',
    create: '/api/tenants',
    update: (id: string) => `/api/tenants/${id}`,
    delete: (id: string) => `/api/tenants/${id}`,
    details: (id: string) => `/api/tenants/${id}`
  },
  users: {
    list: '/api/users',
    create: '/api/users',
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    details: (id: string) => `/api/users/${id}`
  },
  packages: {
    list: '/api/packages',
    create: '/api/packages',
    update: (id: string) => `/api/packages/${id}`,
    delete: (id: string) => `/api/packages/${id}`,
    details: (id: string) => `/api/packages/${id}`
  }
};

export const timeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  veryLong: 60000
};

export const errorMessages = {
  invalidCredentials: 'Invalid email or password',
  sessionExpired: 'Your session has expired',
  networkError: 'Network error occurred',
  serverError: 'Internal server error',
  unauthorized: 'You are not authorized',
  notFound: 'Resource not found',
  validation: 'Validation failed'
};