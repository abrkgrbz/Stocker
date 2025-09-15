import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { envValidator } from '../utils/envValidator';
import { apiRateLimiter } from '../utils/security';
import { message } from 'antd';

// API response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: envValidator.getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check rate limit
    const identifier = `api_${config.method}_${config.url}`;
    if (!apiRateLimiter.isAllowed(identifier)) {
      const remaining = apiRateLimiter.getRemainingRequests(identifier);
      const error = new Error(`Rate limit exceeded. Please wait before making more requests.`);
      error.name = 'RateLimitError';
      message.warning(`Too many requests. Please wait a moment. (${remaining} requests remaining)`);
      return Promise.reject(error);
    }

    // Add auth token to requests
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant context if needed
    const tenantId = sessionStorage.getItem('current_tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    // Log request in development
    if (envValidator.isDevelopment()) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (envValidator.isDevelopment()) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }

    // Handle API success response
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.message || 'İşlem başarısız';
      message.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Log error in development
    if (envValidator.isDevelopment()) {
      console.error('[API Error]', error.response?.data || error.message);
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          tokenStorage.clearToken();
          message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          message.error('Bu işlem için yetkiniz bulunmamaktadır.');
          break;

        case 404:
          // Not found
          message.error('İstenen kaynak bulunamadı.');
          break;

        case 422:
          // Validation error
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => message.error(err));
          } else {
            message.error(data?.message || 'Doğrulama hatası');
          }
          break;

        case 429:
          // Too many requests
          message.error('Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.');
          break;

        case 500:
        case 502:
        case 503:
          // Server error
          message.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
          break;

        default:
          // Other errors
          message.error(data?.message || `Bir hata oluştu (${status})`);
      }
    } else if (error.request) {
      // Request made but no response
      message.error('Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.');
    } else {
      // Something else happened
      message.error('Beklenmeyen bir hata oluştu.');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.post<ApiResponse>('/api/master/auth/login', { email, password }),
    
    logout: () =>
      api.post<ApiResponse>('/api/master/auth/logout'),
    
    refresh: (refreshToken: string) =>
      api.post<ApiResponse>('/api/master/auth/refresh', { refreshToken }),
    
    me: () =>
      api.get<ApiResponse>('/api/master/auth/me'),
  },

  // Master endpoints
  master: {
    // Dashboard
    getDashboardStats: () =>
      api.get<ApiResponse>('/api/master/dashboard/stats'),
    
    // Tenants
    getTenants: (params?: any) =>
      api.get<ApiResponse>('/api/master/tenants', { params }),
    
    getTenant: (id: string) =>
      api.get<ApiResponse>(`/api/master/tenants/${id}`),
    
    createTenant: (data: any) =>
      api.post<ApiResponse>('/api/master/tenants', data),
    
    updateTenant: (id: string, data: any) =>
      api.put<ApiResponse>(`/api/master/tenants/${id}`, data),
    
    deleteTenant: (id: string) =>
      api.delete<ApiResponse>(`/api/master/tenants/${id}`),
    
    // Users
    getUsers: (params?: any) =>
      api.get<ApiResponse>('/api/master/users', { params }),
    
    getUser: (id: string) =>
      api.get<ApiResponse>(`/api/master/users/${id}`),
    
    createUser: (data: any) =>
      api.post<ApiResponse>('/api/master/users', data),
    
    updateUser: (id: string, data: any) =>
      api.put<ApiResponse>(`/api/master/users/${id}`, data),
    
    deleteUser: (id: string) =>
      api.delete<ApiResponse>(`/api/master/users/${id}`),
    
    // Packages
    getPackages: (params?: any) =>
      api.get<ApiResponse>('/api/master/packages', { params }),
    
    getPackage: (id: string) =>
      api.get<ApiResponse>(`/api/master/packages/${id}`),
    
    createPackage: (data: any) =>
      api.post<ApiResponse>('/api/master/packages', data),
    
    updatePackage: (id: string, data: any) =>
      api.put<ApiResponse>(`/api/master/packages/${id}`, data),
    
    deletePackage: (id: string) =>
      api.delete<ApiResponse>(`/api/master/packages/${id}`),
    
    // Settings
    getSettings: () =>
      api.get<ApiResponse>('/api/master/settings'),
    
    updateSettings: (data: any) =>
      api.put<ApiResponse>('/api/master/settings', data),
  },

  // Tenant specific endpoints
  tenant: {
    // Switch tenant context
    switchTenant: (tenantId: string) => {
      sessionStorage.setItem('current_tenant_id', tenantId);
      return Promise.resolve();
    },

    // Get current tenant
    getCurrentTenant: () => {
      return sessionStorage.getItem('current_tenant_id');
    },

    // Tenant dashboard
    getDashboard: (tenantId: string) =>
      api.get<ApiResponse>(`/api/tenants/${tenantId}/dashboard`),
    
    // Tenant users
    getTenantUsers: (tenantId: string, params?: any) =>
      api.get<ApiResponse>(`/api/tenants/${tenantId}/users`, { params }),
    
    // Tenant settings
    getTenantSettings: (tenantId: string) =>
      api.get<ApiResponse>(`/api/tenants/${tenantId}/settings`),
    
    updateTenantSettings: (tenantId: string, data: any) =>
      api.put<ApiResponse>(`/api/tenants/${tenantId}/settings`, data),
  },

  // Health check
  health: () =>
    api.get<ApiResponse>('/health'),
};

// Export axios instance for custom requests
export default api;