import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/constants';
import { setupAuthInterceptor } from '@/shared/utils/auth-interceptor';
import { handleError, parseError } from '@/shared/utils/error-handler';
import { ExponentialBackoff, apiRateLimiter, globalRequestQueue } from '@/shared/utils/rate-limiter';
import { getTenantCode } from '@/shared/utils/subdomain';

interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  skipErrorHandler?: boolean;
  skipRateLimit?: boolean;
  skipQueue?: boolean;
  showErrorNotification?: boolean;
}

// Create enhanced axios instance
export const apiClientEnhanced = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup auth interceptor
setupAuthInterceptor(apiClientEnhanced);

// Request interceptor for rate limiting and queuing
apiClientEnhanced.interceptors.request.use(
  async (config: EnhancedAxiosRequestConfig) => {
    // Skip rate limiting if specified
    if (!config.skipRateLimit) {
      const rateLimitKey = `${config.method}:${config.url}`;
      
      if (!apiRateLimiter.isAllowed(rateLimitKey)) {
        const resetTime = apiRateLimiter.getResetTime(rateLimitKey);
        const waitTime = Math.max(0, resetTime - Date.now());
        
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      }
    }
    
    // Add tenant header
    const tenantCode = getTenantCode();
    if (tenantCode && config.headers) {
      config.headers['X-Tenant-Code'] = tenantCode;
      config.headers['X-Tenant-Subdomain'] = tenantCode;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClientEnhanced.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response for debugging
    if (process.env.NODE_ENV === 'development') {} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as EnhancedAxiosRequestConfig;
    
    // Skip error handler if specified
    if (config?.skipErrorHandler) {
      return Promise.reject(error);
    }
    
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      // Error handling removed for production
} ${config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    // Handle network errors with retry
    if (!error.response && config && shouldRetry(error)) {
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= 3) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClientEnhanced.request(config);
      }
    }
    
    // Handle 5xx errors with retry
    if (error.response?.status && error.response.status >= 500 && config && !config._retry) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= 2) {
        const delay = 1000 * config._retryCount;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClientEnhanced.request(config);
      }
    }
    
    // Handle error with global error handler
    handleError(error, {
      showNotification: config?.showErrorNotification,
      context: `${config?.method?.toUpperCase()} ${config?.url}`,
    });
    
    return Promise.reject(error);
  }
);

// Helper function to determine if request should be retried
function shouldRetry(error: AxiosError): boolean {
  // Don't retry if it's a client error (4xx)
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  
  // Retry on network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return true;
  }
  
  // Retry on timeout
  if (error.message.includes('timeout')) {
    return true;
  }
  
  return false;
}

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced API methods with automatic retry and error handling
export const enhancedApi = {
  async get<T>(url: string, config?: EnhancedAxiosRequestConfig): Promise<T> {
    const backoff = new ExponentialBackoff();
    
    return backoff.execute(
      async () => {
        if (!config?.skipQueue) {
          return globalRequestQueue.add(() => apiClientEnhanced.get<T>(url, config).then(res => res.data));
        }
        const response = await apiClientEnhanced.get<T>(url, config);
        return response.data;
      },
      (error) => shouldRetry(error)
    );
  },
  
  async post<T>(url: string, data?: any, config?: EnhancedAxiosRequestConfig): Promise<T> {
    const backoff = new ExponentialBackoff(1000, 10000, 3);
    
    return backoff.execute(
      async () => {
        if (!config?.skipQueue) {
          return globalRequestQueue.add(() => apiClientEnhanced.post<T>(url, data, config).then(res => res.data));
        }
        const response = await apiClientEnhanced.post<T>(url, data, config);
        return response.data;
      },
      (error) => shouldRetry(error) && !url.includes('login') // Don't retry login requests
    );
  },
  
  async put<T>(url: string, data?: any, config?: EnhancedAxiosRequestConfig): Promise<T> {
    const backoff = new ExponentialBackoff();
    
    return backoff.execute(
      async () => {
        if (!config?.skipQueue) {
          return globalRequestQueue.add(() => apiClientEnhanced.put<T>(url, data, config).then(res => res.data));
        }
        const response = await apiClientEnhanced.put<T>(url, data, config);
        return response.data;
      },
      (error) => shouldRetry(error)
    );
  },
  
  async patch<T>(url: string, data?: any, config?: EnhancedAxiosRequestConfig): Promise<T> {
    const backoff = new ExponentialBackoff();
    
    return backoff.execute(
      async () => {
        if (!config?.skipQueue) {
          return globalRequestQueue.add(() => apiClientEnhanced.patch<T>(url, data, config).then(res => res.data));
        }
        const response = await apiClientEnhanced.patch<T>(url, data, config);
        return response.data;
      },
      (error) => shouldRetry(error)
    );
  },
  
  async delete<T>(url: string, config?: EnhancedAxiosRequestConfig): Promise<T> {
    const backoff = new ExponentialBackoff(1000, 5000, 2);
    
    return backoff.execute(
      async () => {
        if (!config?.skipQueue) {
          return globalRequestQueue.add(() => apiClientEnhanced.delete<T>(url, config).then(res => res.data));
        }
        const response = await apiClientEnhanced.delete<T>(url, config);
        return response.data;
      },
      (error) => shouldRetry(error)
    );
  },
};

// Batch API requests
export async function batchApiRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
  const results = await Promise.allSettled(requests.map(req => req()));
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: parseError(result.reason) };
    }
  });
}

// Cancel token source for cancellable requests
export function createCancelToken() {
  return axios.CancelToken.source();
}

// Check if error is a cancelled request
export function isRequestCancelled(error: any): boolean {
  return axios.isCancel(error);
}

// Export enhanced client as default
export default apiClientEnhanced;