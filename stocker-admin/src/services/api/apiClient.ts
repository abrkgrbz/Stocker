import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { rateLimiter } from '../../utils/rateLimiter';

// Extend InternalAxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
  skipRateLimit?: boolean;
}
import { tokenStorage } from '../../utils/tokenStorage';
import { errorService, AppError, ERROR_CODES } from '../errorService';
import { sentryService } from '../sentryService';

// API response types matching backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
  user: UserInfo;
  requires2FA?: boolean;
  tempToken?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  roles: string[];
  tenantId?: string;
  tenantName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';
    
    this.client = axios.create({
      baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
      // Ensure proper UTF-8 handling
      transformRequest: [(data, headers) => {
        if (data && typeof data === 'object') {
          // Don't transform the data, just stringify it
          return JSON.stringify(data);
        }
        return data;
      }],
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request:', config.url, 'Token exists:', !!token);
        } else {
          console.warn('⚠️ No token available for request:', config.url);
        }

        // Add request tracking for monitoring
        (config as ExtendedAxiosRequestConfig).metadata = { startTime: new Date().getTime() };
        
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Track response time
        const config = response.config as ExtendedAxiosRequestConfig;
        if (config.metadata) {
          const duration = new Date().getTime() - config.metadata.startTime;
          sentryService.measurePerformance(`api_${response.config.url}`, async () => duration);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Track API errors
        if (error.response) {
          sentryService.captureException(error, {
            endpoint: originalRequest?.url,
            status: error.response.status,
            method: originalRequest?.method,
          });
        }

        // Handle 429 Rate Limit - retry with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Get retry-after header if available
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000; // Default 2 seconds
          
          console.warn(`⏳ Rate limited. Retrying after ${delay}ms...`);
          
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(originalRequest);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            originalRequest._retry = true;

            try {
              const refreshToken = tokenStorage.getRefreshToken();
              if (refreshToken) {
                const response = await this.refreshAccessToken(refreshToken);
                const newToken = response.data.accessToken;
                
                tokenStorage.setToken(newToken);
                tokenStorage.setRefreshToken(response.data.refreshToken);
                
                this.onRefreshed(newToken);
                this.refreshSubscribers = [];
                
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              this.onRefreshFailed();
              tokenStorage.clearToken();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          // Wait for token refresh
          return new Promise((resolve) => {
            this.subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(this.client(originalRequest));
            });
          });
        }

        // Handle other errors
        const appError = this.handleApiError(error);
        errorService.handleError(appError);
        return Promise.reject(appError);
      }
    );
  }

  private handleApiError(error: AxiosError<ApiResponse>): AppError {
    if (error.response) {
      const { status, data } = error.response;
      // RFC 7231 Problem Details format uses 'detail' field, fallback to 'message' or default
      const message = (data as any)?.detail || data?.message || this.getDefaultErrorMessage(status);

      let errorCode = ERROR_CODES.API_ERROR;
      switch (status) {
        case 400:
          errorCode = ERROR_CODES.VALIDATION_ERROR;
          break;
        case 401:
          errorCode = ERROR_CODES.UNAUTHORIZED;
          break;
        case 403:
          errorCode = ERROR_CODES.FORBIDDEN;
          break;
        case 404:
          errorCode = ERROR_CODES.NOT_FOUND;
          break;
        case 429:
          errorCode = ERROR_CODES.RATE_LIMIT;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorCode = ERROR_CODES.SERVER_ERROR;
          break;
      }

      return new AppError(message, errorCode, status);
    } else if (error.request) {
      return new AppError('Network error. Please check your connection.', ERROR_CODES.NETWORK_ERROR);
    }

    return new AppError('An unexpected error occurred', ERROR_CODES.UNKNOWN);
  }

  private getDefaultErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway',
      503: 'Service unavailable',
      504: 'Gateway timeout',
    };
    
    return messages[status] || 'An error occurred';
  }

  private async refreshAccessToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      `${this.client.defaults.baseURL}/api/master/auth/refresh`,
      { refreshToken }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new AppError('Token refresh failed', ERROR_CODES.TOKEN_EXPIRED);
    }
    
    return response.data;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private onRefreshFailed() {
    this.refreshSubscribers = [];
  }

  // Public API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Use master auth endpoint for admin login
      const response = await this.client.post<ApiResponse<AuthResponse>>('/api/master/auth/login', credentials);

      // Check if 2FA is required
      if (response.data.data?.requires2FA) {
        return {
          ...response.data.data,
          requires2FA: true,
          tempToken: response.data.data.tempToken
        };
      }

      // Check if the response is successful
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      // Handle error response
      throw new AppError(response.data.message || 'Login failed', ERROR_CODES.INVALID_CREDENTIALS);
    } catch (error: any) {
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new AppError(error.response.data.message, ERROR_CODES.INVALID_CREDENTIALS);
      }
      throw new AppError('Login failed', ERROR_CODES.INVALID_CREDENTIALS);
    }
  }

  async check2FALockout(email: string): Promise<{ isLockedOut: boolean; minutesRemaining?: number; secondsRemaining?: number; message?: string }> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/api/master/auth/check-2fa-lockout', {
        params: { email }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return { isLockedOut: false };
    } catch (error: any) {
      console.error('Failed to check 2FA lockout status:', error);
      return { isLockedOut: false };
    }
  }

  async verify2FA(params: { email: string; tempToken: string; code: string }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/api/master/auth/verify-2fa', {
        email: params.email,
        code: params.code,
        tempToken: params.tempToken
      });

      if (response.data.success && response.data.data) {
        return response.data;
      }

      throw new AppError(response.data.message || '2FA verification failed', ERROR_CODES.INVALID_CREDENTIALS);
    } catch (error: any) {
      // RFC 7231 Problem Details format uses 'detail' field for error messages
      if (error.response?.data?.detail) {
        throw new AppError(error.response.data.detail, ERROR_CODES.INVALID_CREDENTIALS);
      }
      if (error.response?.data?.message) {
        throw new AppError(error.response.data.message, ERROR_CODES.INVALID_CREDENTIALS);
      }
      throw new AppError('2FA verification failed', ERROR_CODES.INVALID_CREDENTIALS);
    }
  }

  async verifyBackupCode(params: { email: string; tempToken: string; code: string }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/api/master/auth/verify-backup-code', {
        email: params.email,
        code: params.code,
        tempToken: params.tempToken,
        isBackupCode: true
      });

      if (response.data.success && response.data.data) {
        return response.data;
      }

      throw new AppError(response.data.message || 'Backup code verification failed', ERROR_CODES.INVALID_CREDENTIALS);
    } catch (error: any) {
      // RFC 7231 Problem Details format uses 'detail' field for error messages
      if (error.response?.data?.detail) {
        throw new AppError(error.response.data.detail, ERROR_CODES.INVALID_CREDENTIALS);
      }
      if (error.response?.data?.message) {
        throw new AppError(error.response.data.message, ERROR_CODES.INVALID_CREDENTIALS);
      }
      throw new AppError('Backup code verification failed', ERROR_CODES.INVALID_CREDENTIALS);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/master/auth/logout');
    } catch (error) {
      // Logout should always succeed locally even if API call fails
      console.error('Logout API call failed:', error);
    }
  }

  async verifyEmail(email: string, token: string): Promise<ApiResponse> {
    // Use tenant registration endpoint for email verification (not normal user auth)
    const response = await this.client.post<ApiResponse>('/api/public/tenant-registration/verify-email', { email, token });
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>('/api/auth/resend-verification-email', { email });
    return response.data;
  }

  // Generic request methods for other API calls with rate limiting
  async get<T = any>(url: string, params?: any): Promise<T> {
    return rateLimiter.throttle(url, async () => {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      
      if (!response.data.success) {
        throw new AppError(response.data.message || 'Request failed', ERROR_CODES.API_ERROR);
      }
      
      return response.data.data as T;
    });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return rateLimiter.throttle(url, async () => {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      
      if (!response.data.success) {
        throw new AppError(response.data.message || 'Request failed', ERROR_CODES.API_ERROR);
      }
      
      return response.data.data as T;
    });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return rateLimiter.throttle(url, async () => {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      
      if (!response.data.success) {
        throw new AppError(response.data.message || 'Request failed', ERROR_CODES.API_ERROR);
      }
      
      return response.data.data as T;
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return rateLimiter.throttle(url, async () => {
      const response = await this.client.delete<ApiResponse<T>>(url);
      
      if (!response.data.success) {
        throw new AppError(response.data.message || 'Request failed', ERROR_CODES.API_ERROR);
      }
      
      return response.data.data as T;
    });
  }

  // Get axios instance for advanced use cases
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();