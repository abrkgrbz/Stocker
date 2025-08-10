import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/constants';
import { ApiResponse } from '@/shared/types';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
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
        // Refresh failed, redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
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