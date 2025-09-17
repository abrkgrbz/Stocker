import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5104';
const TIMEOUT = 30000; // 30 seconds

// ==================== Types ====================
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  errors?: string[];
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  showError?: boolean;
  retryCount?: number;
}

// ==================== Token Management ====================
class TokenManager {
  private static TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static TOKEN_EXPIRY_KEY = 'token_expiry';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string, expiresIn?: number): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (expiresIn) {
      const expiry = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    }
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    return Date.now() > parseInt(expiry);
  }
}

// ==================== Request Queue (for token refresh) ====================
class RequestQueue {
  private static queue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: InternalAxiosRequestConfig;
  }> = [];
  private static isRefreshing = false;

  static async addToQueue(config: InternalAxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, config });
    });
  }

  static async processQueue(error?: any): Promise<void> {
    const requests = [...this.queue];
    this.queue = [];

    if (error) {
      requests.forEach(({ reject }) => reject(error));
    } else {
      const token = TokenManager.getToken();
      requests.forEach(({ resolve, config }) => {
        config.headers.Authorization = `Bearer ${token}`;
        resolve(apiClient.request(config));
      });
    }
  }

  static setRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  static getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

// ==================== Error Handler ====================
class ApiErrorHandler {
  static handle(error: any, showError = true): void {
    if (process.env.NODE_ENV !== 'production') {
      // Error handling removed for production
    }

    if (!showError) return;

    const errorMessage = this.extractErrorMessage(error);
    message.error(errorMessage);
  }

  private static extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors?.length > 0) {
      return error.response.data.errors[0];
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

// ==================== Axios Instance ====================
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// ==================== Request Interceptor ====================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for certain endpoints
    const skipAuth = config.headers?.['Skip-Auth'] === 'true';
    delete config.headers?.['Skip-Auth'];

    if (!skipAuth) {
      const token = TokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add tenant header if in subdomain
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== Response Interceptor ====================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, add to queue
      if (RequestQueue.getIsRefreshing()) {
        return RequestQueue.addToQueue(originalRequest);
      }

      RequestQueue.setRefreshing(true);

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
        TokenManager.setToken(token, expiresIn);
        TokenManager.setRefreshToken(newRefreshToken);

        // Process queued requests
        await RequestQueue.processQueue();
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(originalRequest);

      } catch (refreshError) {
        TokenManager.clearTokens();
        await RequestQueue.processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        RequestQueue.setRefreshing(false);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== API Methods ====================
class ApiService {
  // GET request
  async get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, options);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // POST request
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, options);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // PUT request
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, options);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // DELETE request
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, options);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, options);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // Upload file
  async upload<T = any>(url: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, formData, {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }

  // Download file
  async download(url: string, filename?: string, options?: RequestOptions): Promise<void> {
    try {
      const response = await apiClient.get(url, {
        ...options,
        responseType: 'blob'
      });

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
      ApiErrorHandler.handle(error, options?.showError !== false);
      throw error;
    }
  }
}

// ==================== Specialized Services ====================
export class AuthService {
  private api = new ApiService();

  async login(email: string, password: string, tenantCode?: string) {
    const response = await this.api.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
      user: any;
    }>('/api/auth/login', { email, password, tenantCode });

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token, response.data.expiresIn);
      TokenManager.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.api.post('/api/auth/logout');
    } finally {
      TokenManager.clearTokens();
      window.location.href = '/login';
    }
  }

  async register(data: any) {
    return this.api.post('/api/auth/register', data);
  }

  async forgotPassword(email: string) {
    return this.api.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.api.post('/api/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string) {
    return this.api.post('/api/auth/verify-email', { token });
  }
}

export class TenantService {
  private api = new ApiService();

  async checkTenant(slug: string) {
    return this.api.get(`/api/public/tenants/check/${slug}`, { skipAuth: true });
  }

  async getTenants(params?: any) {
    return this.api.get<PaginatedResponse<any>>('/api/master/tenants', { params });
  }

  async getTenant(id: string) {
    return this.api.get(`/api/master/tenants/${id}`);
  }

  async createTenant(data: any) {
    return this.api.post('/api/master/tenants', data);
  }

  async updateTenant(id: string, data: any) {
    return this.api.put(`/api/master/tenants/${id}`, data);
  }

  async deleteTenant(id: string) {
    return this.api.delete(`/api/master/tenants/${id}`);
  }
}

// ==================== Exports ====================
export const api = new ApiService();
export const authService = new AuthService();
export const tenantService = new TenantService();

// Export token manager for external use
export { TokenManager };

// Default export for backward compatibility
export default apiClient;