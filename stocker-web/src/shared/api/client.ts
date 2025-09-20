import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { tokenService } from '@/services/tokenService';
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
    // Get token from tokenService (memory)
    const token = tokenService.getAccessToken();
    
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
        // Tenant ID is not a valid GUID, using X-Tenant-Code instead
      }
    }
    
    // API request configured
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    // API response successful
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // API error occurred
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't redirect immediately after login - give it some time
      const loginTime = localStorage.getItem('last_login_time');
      const timeSinceLogin = loginTime ? Date.now() - parseInt(loginTime) : Infinity;
      
      // If we just logged in (within last 5 seconds), don't redirect
      if (timeSinceLogin < 5000) {
        // 401 received shortly after login, not redirecting
        return Promise.reject(error);
      }
      
      try {
        // Try to refresh token using tokenService
        const newToken = await tokenService.refreshAccessToken();
        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        if (timeSinceLogin > 5000) {
          await tokenService.logout();
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