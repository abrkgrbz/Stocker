import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import env from '@/config/env';
import errorHandler from '@/utils/errorHandler';
import logger from '@/utils/logger';

const apiClient: AxiosInstance = axios.create({
  baseURL: env.api.baseURL,
  timeout: env.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management
const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(env.auth.tokenKey);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(env.auth.refreshTokenKey);
  },
  
  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(env.auth.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(env.auth.refreshTokenKey, refreshToken);
    }
  },
  
  clearTokens: (): void => {
    localStorage.removeItem(env.auth.tokenKey);
    localStorage.removeItem(env.auth.refreshTokenKey);
    localStorage.removeItem(env.auth.tenantKey);
  },
  
  getTenantId: (): string | null => {
    return localStorage.getItem(env.auth.tenantKey);
  },
  
  setTenantId: (tenantId: string): void => {
    localStorage.setItem(env.auth.tenantKey, tenantId);
  },
};

// Request queue for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Add auth token
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    // Add tenant header
    const tenantId = tokenManager.getTenantId();
    if (tenantId) {
      config.headers = {
        ...config.headers,
        'X-Tenant-Id': tenantId,
      };
    }
    
    // Add request ID for tracking
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    config.headers = {
      ...config.headers,
      'X-Request-Id': requestId,
    };
    
    // Log request
    logger.debug('API Request', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
      requestId,
    }, 'API');
    
    return config;
  },
  (error: AxiosError) => {
    logger.error('Request interceptor error', error, 'API');
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response
    logger.debug('API Response', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    }, 'API');
    
    // Handle success messages
    if (response.data?.message && response.config.method !== 'get') {
      message.success(response.data.message);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Log error
    logger.error('API Error', error, 'API');
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${env.api.baseURL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setTokens(accessToken, newRefreshToken);
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    errorHandler.handle(error);
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },
  
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
  
  // File upload
  upload: <T = unknown>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  // File download
  download: (url: string, filename?: string): Promise<void> => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then(response => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

// Export token manager for use in auth services
export { tokenManager };

export default apiClient;