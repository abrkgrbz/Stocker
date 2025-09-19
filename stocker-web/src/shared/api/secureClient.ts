import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { ApiResponse } from '@/shared/types';
import { getTenantCode } from '@/shared/utils/subdomain';
import tokenService from '@/services/tokenService';

// Create secure axios instance
export const secureApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Always send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and tenant headers
secureApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from secure service (memory, not localStorage)
    const token = tokenService.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant headers (tenant code is not sensitive)
    const tenantCodeFromSubdomain = getTenantCode();
    const tenantCodeFromStorage = localStorage.getItem('X-Tenant-Code');
    const tenantId = localStorage.getItem('tenant_id'); // Non-sensitive tenant ID
    
    const tenantCode = tenantCodeFromSubdomain || tenantCodeFromStorage;
    
    if (tenantCode && config.headers) {
      config.headers['X-Tenant-Code'] = tenantCode;
      config.headers['X-Tenant-Subdomain'] = tenantCode;
    }
    
    // Only set X-Tenant-Id if it's a valid GUID
    if (tenantId && config.headers) {
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(tenantId)) {
        config.headers['X-Tenant-Id'] = tenantId;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
secureApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const newAccessToken = await tokenService.refreshAccessToken();
        
        if (newAccessToken && originalRequest.headers) {
          // Retry with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return secureApiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await tokenService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden (no permission)
    if (error.response?.status === 403) {
      // User doesn't have permission for this resource
      const errorMessage = error.response?.data?.message || 'You do not have permission to access this resource';
      return Promise.reject(new Error(errorMessage));
    }

    // Handle other errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

// Export for backward compatibility during migration
export const api = secureApiClient;

export default secureApiClient;