/**
 * Application Constants
 * Centralized configuration to avoid magic numbers and strings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY: 3600, // 1 hour in seconds
  REFRESH_EXPIRY: 604800, // 7 days in seconds
  SESSION_TIMEOUT: 1800000, // 30 minutes in ms
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  API_MAX_REQUESTS: 30,
  API_WINDOW_MS: 60000, // 1 minute
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 300000, // 5 minutes
  UPLOAD_MAX_REQUESTS: 10,
  UPLOAD_WINDOW_MS: 60000, // 1 minute
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10485760, // 10MB in bytes
  MAX_IMAGE_SIZE: 5242880, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES: 10,
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // 3 seconds
  NOTIFICATION_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  THROTTLE_DELAY: 1000, // 1 second
  ANIMATION_DURATION: 300, // 300ms
  MODAL_Z_INDEX: 1000,
  DRAWER_WIDTH: 400,
  TABLE_SCROLL_Y: 600,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s()+-]+$/,
  URL_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{3,20}$/,
  SUBDOMAIN_REGEX: /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;

// Tenant Configuration
export const TENANT_CONFIG = {
  MAX_USERS: 500,
  MAX_STORAGE_GB: 100,
  DEFAULT_STORAGE_GB: 10,
  MAX_API_KEYS: 10,
  MAX_WEBHOOKS: 20,
  MAX_DOMAINS: 5,
  TRIAL_DAYS: 14,
  GRACE_PERIOD_DAYS: 7,
} as const;

// Package/Plan Limits
export const PACKAGE_LIMITS = {
  STARTER: {
    MAX_USERS: 10,
    MAX_STORAGE_GB: 10,
    MAX_API_CALLS: 1000,
    PRICE: 29,
  },
  PROFESSIONAL: {
    MAX_USERS: 50,
    MAX_STORAGE_GB: 50,
    MAX_API_CALLS: 10000,
    PRICE: 99,
  },
  ENTERPRISE: {
    MAX_USERS: 500,
    MAX_STORAGE_GB: 500,
    MAX_API_CALLS: 100000,
    PRICE: 299,
  },
} as const;

// Status Values
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
  EXPIRED: 'expired',
  TRIAL: 'trial',
} as const;

// Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MMMM YYYY',
} as const;

// Colors (for charts and status indicators)
export const COLORS = {
  PRIMARY: '#667eea',
  SUCCESS: '#48bb78',
  WARNING: '#ed8936',
  DANGER: '#f56565',
  INFO: '#4299e1',
  DARK: '#1a1f36',
  LIGHT: '#f7fafc',
  
  // Chart colors
  CHART_COLORS: [
    '#667eea',
    '#48bb78',
    '#ed8936',
    '#4299e1',
    '#f56565',
    '#38b2ac',
    '#ed64a6',
    '#9f7aea',
  ],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  TABLE_SETTINGS: 'table-settings',
  FILTERS: 'filters',
  PREFERENCES: 'user-preferences',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/master/auth/login',
  LOGOUT: '/api/master/auth/logout',
  REFRESH: '/api/master/auth/refresh',
  VERIFY_EMAIL: '/api/master/auth/verify',
  RESET_PASSWORD: '/api/master/auth/reset-password',
  
  // Tenants
  TENANTS: '/api/master/tenants',
  TENANT_BY_ID: (id: string) => `/api/master/tenants/${id}`,
  TENANT_USERS: (id: string) => `/api/master/tenants/${id}/users`,
  TENANT_BILLING: (id: string) => `/api/master/tenants/${id}/billing`,
  TENANT_SETTINGS: (id: string) => `/api/master/tenants/${id}/settings`,
  
  // Users
  USERS: '/api/master/users',
  USER_BY_ID: (id: string) => `/api/master/users/${id}`,
  
  // Packages
  PACKAGES: '/api/master/packages',
  PACKAGE_BY_ID: (id: string) => `/api/master/packages/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: '/api/master/dashboard/stats',
  DASHBOARD_CHARTS: '/api/master/dashboard/charts',
  
  // Monitoring
  HEALTH_CHECK: '/api/health',
  METRICS: '/api/metrics',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  NETWORK: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
  UNAUTHORIZED: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  FORBIDDEN: 'Bu işlem için yetkiniz yok.',
  NOT_FOUND: 'Aradığınız kayıt bulunamadı.',
  VALIDATION: 'Lütfen formu kontrol edin.',
  SERVER: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Başarıyla kaydedildi.',
  UPDATED: 'Başarıyla güncellendi.',
  DELETED: 'Başarıyla silindi.',
  CREATED: 'Başarıyla oluşturuldu.',
  SENT: 'Başarıyla gönderildi.',
  COPIED: 'Panoya kopyalandı.',
  UPLOADED: 'Başarıyla yüklendi.',
} as const;

// Regex Patterns (for validation)
export const PATTERNS = {
  EMAIL: VALIDATION_RULES.EMAIL_REGEX.source,
  PHONE: VALIDATION_RULES.PHONE_REGEX.source,
  URL: VALIDATION_RULES.URL_REGEX.source,
  USERNAME: VALIDATION_RULES.USERNAME_REGEX.source,
  SUBDOMAIN: VALIDATION_RULES.SUBDOMAIN_REGEX.source,
  PASSWORD: VALIDATION_RULES.PASSWORD_REGEX.source,
} as const;

// Export type utilities
export type Status = typeof STATUS[keyof typeof STATUS];
export type Role = typeof ROLES[keyof typeof ROLES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS];