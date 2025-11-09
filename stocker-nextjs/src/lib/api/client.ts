import type { ApiResponse, ApiError, ApiRequestOptions } from './types';

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Custom API Error Class
 */
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public error: ApiError,
    public response?: Response
  ) {
    super(error.message);
    this.name = 'ApiClientError';
  }
}

/**
 * Build query string from params
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * API Client - Central HTTP client for all API requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Get tenant code from cookie (browser only)
   */
  private getTenantCode(): string | null {
    if (typeof window === 'undefined') return null;

    const tenantCodeCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('tenant-code='));

    return tenantCodeCookie ? tenantCodeCookie.split('=')[1] : null;
  }

  /**
   * Get tenant ID from localStorage (browser only)
   */
  private getTenantId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tenantId');
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      signal,
    } = options;

    const url = `${this.baseUrl}${endpoint}${buildQueryString(params)}`;

    // Add tenant headers if available
    const tenantCode = this.getTenantCode();
    const tenantId = this.getTenantId();
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    if (tenantCode) {
      requestHeaders['X-Tenant-Code'] = tenantCode;
    }

    if (tenantId) {
      requestHeaders['X-Tenant-Id'] = tenantId;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include HttpOnly cookies for authentication
      signal,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Transform backend error response to ApiError format
        // Backend returns: { detail, errors: [{code, message}], ... }
        const apiError: ApiError = {
          code: (data.errors?.[0]?.code || 'UNKNOWN_ERROR') as any,
          message: data.detail || data.errors?.[0]?.message || data.message || 'An error occurred',
          details: data.errors || data,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        throw new ApiClientError(
          response.status,
          apiError,
          response
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError(
            408,
            {
              code: 'TIMEOUT',
              message: 'İstek zaman aşımına uğradı',
              timestamp: new Date().toISOString(),
            } as any
          );
        }

        throw new ApiClientError(
          0,
          {
            code: 'NETWORK_ERROR',
            message: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
            details: error.message,
            timestamp: new Date().toISOString(),
          } as any
        );
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params, signal });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, signal });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, signal });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, signal });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', signal });
  }
}

/**
 * Default API Client Instance
 */
export const apiClient = new ApiClient();

/**
 * Helper function to handle API errors
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Bilinmeyen bir hata oluştu';
}

/**
 * Helper function to check if error is specific type
 */
export function isApiError(error: unknown, code: string): boolean {
  return error instanceof ApiClientError && error.error.code === code;
}
