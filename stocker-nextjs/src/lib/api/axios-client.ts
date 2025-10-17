import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { cookieStorage } from '../auth/cookie-storage';

// Function to get API URL dynamically (works in SSR and client-side)
const getApiUrl = (): string => {
  // In production, always use auth.stoocker.app
  if (typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app')) {
    return 'https://auth.stoocker.app';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104';
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically set baseURL in production to ensure it always points to auth.stoocker.app
    if (typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app')) {
      config.baseURL = 'https://auth.stoocker.app';
    }

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
          const apiUrl = getApiUrl();
          const response = await axios.post(`${apiUrl}/auth/refresh`, {
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
