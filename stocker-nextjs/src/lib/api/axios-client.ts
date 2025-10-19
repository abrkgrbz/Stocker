import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Use relative path /api which Next.js rewrites to backend API
// This works for both same-origin (auth.stoocker.app) and cross-subdomain (tenant.stoocker.app)
const API_URL = '/api';

// Create axios instance with cookie support
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Enable HttpOnly cookie support
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ NO TOKEN READING - Browser automatically sends HttpOnly cookies
    // Backend will read access_token from cookie

    // Add tenant code from cookie (readable, not HttpOnly)
    if (typeof window !== 'undefined' && config.headers) {
      // Try to get tenant-code from cookie
      const cookies = document.cookie.split(';');
      const tenantCodeCookie = cookies.find(c => c.trim().startsWith('tenant-code='));

      if (tenantCodeCookie) {
        const tenantCode = tenantCodeCookie.split('=')[1];
        config.headers['X-Tenant-Code'] = tenantCode;
      }

      // Fallback to localStorage for backward compatibility
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
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
        // ✅ Try to refresh token using HttpOnly cookie
        // Backend /auth/refresh endpoint will read refresh_token cookie
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {}, // Empty body - token is in HttpOnly cookie
          { withCredentials: true } // Include cookies
        );

        // ✅ Backend sets new access_token cookie automatically
        // Just retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          // Clear any localStorage data
          localStorage.removeItem('tenantId');
          localStorage.removeItem('tenantIdentifier');
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
