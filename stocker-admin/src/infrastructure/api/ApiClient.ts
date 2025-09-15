/**
 * Centralized API Client
 * Single source of truth for all API communications
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenStorage } from '../../utils/tokenStorage';
import { errorService, AppError, ERROR_CODES } from '../../services/errorService';
import { API_CONFIG, RATE_LIMIT_CONFIG } from '../../constants';

// Request/Response interceptor types
interface IApiRequest extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * API Client class with interceptors, retry logic, and error handling
 */
export class ApiClient {
  private client: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: IApiRequest) => {
        // Add auth token
        const token = tokenStorage.getToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }

        // Add request ID for tracking
        config.headers = {
          ...config.headers,
          'X-Request-ID': this.generateRequestId(),
        };

        // Check rate limiting
        if (!this.checkRateLimit(config.url || '')) {
          throw new AppError(
            'Rate limit exceeded',
            ERROR_CODES.RATE_LIMIT
          );
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<IApiResponse>) => {
        // Handle successful response
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as IApiRequest;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            await this.refreshToken();
            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            tokenStorage.clearToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors with retry logic
        if (this.shouldRetry(error) && originalRequest) {
          return this.retryRequest(originalRequest);
        }

        // Let error service handle the error
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = this.getEndpointKey(endpoint);
    
    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, []);
    }

    const requests = this.rateLimitTracker.get(key)!;
    const recentRequests = requests.filter(
      time => now - time < RATE_LIMIT_CONFIG.API_WINDOW_MS
    );

    if (recentRequests.length >= RATE_LIMIT_CONFIG.API_MAX_REQUESTS) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimitTracker.set(key, recentRequests);
    return true;
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    if (!error.config) return false;

    const config = error.config as IApiRequest;
    const retryCount = config._retryCount || 0;

    // Max retry attempts reached
    if (retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
      return false;
    }

    // Only retry on network errors or 5xx errors
    const status = error.response?.status;
    return !status || status >= 500;
  }

  /**
   * Retry failed request with exponential backoff
   */
  private async retryRequest(config: IApiRequest): Promise<any> {
    config._retryCount = (config._retryCount || 0) + 1;

    // Exponential backoff
    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, config._retryCount - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.client(config);
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    // Implementation depends on your auth strategy
    // This is a placeholder
    const response = await this.post('/auth/refresh', {
      refreshToken: tokenStorage.getRefreshToken?.() || '',
    });

    if (response.data?.accessToken) {
      tokenStorage.setToken(response.data.accessToken);
    } else {
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get endpoint key for rate limiting
   */
  private getEndpointKey(url: string): string {
    // Extract endpoint from URL
    const match = url.match(/\/api\/[^?]*/);
    return match ? match[0] : url;
  }

  /**
   * Request deduplication - prevent duplicate requests
   */
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // HTTP Methods

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      const response = await this.client.get<IApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      const response = await this.client.post<IApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      const response = await this.client.put<IApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      const response = await this.client.delete<IApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    try {
      const response = await this.client.patch<IApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<IApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post<IApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;