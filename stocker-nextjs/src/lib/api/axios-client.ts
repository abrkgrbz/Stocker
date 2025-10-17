import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { cookieStorage } from '../auth/cookie-storage';

// Use relative path /api which Next.js rewrites to backend API
// This works for both same-origin (auth.stoocker.app) and cross-subdomain (tenant.stoocker.app)
const API_URL = '/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookies (works across subdomains)
    if (typeof window !== 'undefined') {
      const token = cookieStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add tenant identifier to headers
      const tenantId = cookieStorage.getItem('tenantId');
      if (tenantId && config.headers) {
        config.headers['X-Tenant-Id'] = tenantId;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = typeof window !== 'undefined'
          ? cookieStorage.getItem('refreshToken')
          : null;

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;

          if (typeof window !== 'undefined') {
            cookieStorage.setItem('accessToken', accessToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          cookieStorage.removeItem('accessToken');
          cookieStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
