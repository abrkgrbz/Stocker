import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/constants';
import { ApiResponse } from '@/shared/types';
import { getTenantCode } from '@/shared/utils/subdomain';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export as api for compatibility
export const api = apiClient;

// Request interceptor for adding auth token and tenant header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant headers from multiple sources
    const tenantCodeFromSubdomain = getTenantCode();
    const tenantCodeFromStorage = localStorage.getItem('X-Tenant-Code');
    const tenantIdFromStorage = localStorage.getItem('X-Tenant-Id') || localStorage.getItem('stocker_tenant');
    
    const tenantCode = tenantCodeFromSubdomain || tenantCodeFromStorage;
    
    // IMPORTANT: Backend expects X-Tenant-Code for tenant resolution
    // X-Tenant-Id should only be set if we have a valid GUID
    if (tenantCode && config.headers) {
      config.headers['X-Tenant-Code'] = tenantCode;
      config.headers['X-Tenant-Subdomain'] = tenantCode;
    }
    
    // Only set X-Tenant-Id if it's a valid GUID
    if (tenantIdFromStorage && config.headers) {
      // Check if it's a valid GUID format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(tenantIdFromStorage)) {
        config.headers['X-Tenant-Id'] = tenantIdFromStorage;
      }
      // If it's not a GUID but we have a tenant code, use X-Tenant-Code instead
      else if (tenantCode) {
        console.log('⚠️ Tenant ID is not a valid GUID, using X-Tenant-Code instead');
      }
    }
    
    // Always log for debugging (remove after fixing)
    console.log('📡 API Request:', {
      url: config.url,
      method: config.method,
      headers: {
        authorization: config.headers?.Authorization ? 'Bearer token present' : 'Missing',
        'X-Tenant-Code': config.headers?.['X-Tenant-Code'] || 'Missing',
        'X-Tenant-Id': config.headers?.['X-Tenant-Id'] || 'Missing',
        'X-Tenant-Subdomain': config.headers?.['X-Tenant-Subdomain'] || 'Missing'
      },
      localStorage: {
        tenantCodeFromStorage,
        tenantIdFromStorage,
        tenantCodeFromSubdomain
      },
      actualHeaders: config.headers
    });
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // Log error details
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't redirect immediately after login - give it some time
      const loginTime = localStorage.getItem('last_login_time');
      const timeSinceLogin = loginTime ? Date.now() - parseInt(loginTime) : Infinity;
      
      // If we just logged in (within last 5 seconds), don't redirect
      if (timeSinceLogin < 5000) {
        console.log('⚠️ 401 received shortly after login, not redirecting');
        return Promise.reject(error);
      }
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            accessToken: localStorage.getItem(TOKEN_KEY),
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem(TOKEN_KEY, accessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login only if not recently logged in
        if (timeSinceLogin > 5000) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
);

// Export apiClient directly for use in API modules