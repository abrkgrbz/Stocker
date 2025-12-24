import type { ApiResponse, ApiError, ApiRequestOptions } from './types';

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Retry Configuration for 429 and transient errors
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

/**
 * Request Queue for Rate Limiting
 */
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // Minimum 100ms between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minRequestInterval) {
        await this.sleep(this.minRequestInterval - timeSinceLastRequest);
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Increase interval when rate limited
  increaseInterval() {
    this.minRequestInterval = Math.min(this.minRequestInterval * 2, 2000);
  }

  // Reset interval when requests succeed
  resetInterval() {
    this.minRequestInterval = 100;
  }
}

const requestQueue = new RequestQueue();

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
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private getRetryDelay(attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return Math.min(retryAfter * 1000, MAX_RETRY_DELAY);
    }
    // Exponential backoff with jitter
    const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
    const jitter = Math.random() * 500; // Add random jitter up to 500ms
    return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(status: number): boolean {
    // 429 Too Many Requests, 503 Service Unavailable, 504 Gateway Timeout
    return [429, 503, 504].includes(status);
  }

  /**
   * Execute single request
   */
  private async executeRequest<T>(
    url: string,
    config: RequestInit,
    signal?: AbortSignal
  ): Promise<{ response: Response; data: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...config,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle empty responses
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return { response, data };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Generic request method with retry logic for 429 errors
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
      credentials: 'include',
      signal,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    // Use request queue to throttle requests
    return requestQueue.add(async () => {
      let lastError: ApiClientError | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { response, data } = await this.executeRequest<T>(url, config, signal);

          if (!response.ok) {
            // Check if we should retry
            if (this.isRetryableError(response.status) && attempt < MAX_RETRIES) {
              // Parse Retry-After header if present
              const retryAfterHeader = response.headers.get('Retry-After');
              const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

              // Increase request interval for rate limiting
              if (response.status === 429) {
                requestQueue.increaseInterval();
                console.warn(`[API] Rate limited (429). Retrying in ${this.getRetryDelay(attempt, retryAfter)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
              }

              await this.sleep(this.getRetryDelay(attempt, retryAfter));
              continue;
            }

            // Transform backend error response to ApiError format
            const apiError: ApiError = {
              code: (data?.errors?.[0]?.code || 'UNKNOWN_ERROR') as any,
              message: data?.detail || data?.errors?.[0]?.message || data?.message || 'An error occurred',
              details: data?.errors || data,
              timestamp: data?.timestamp || new Date().toISOString(),
            };

            throw new ApiClientError(response.status, apiError, response);
          }

          // Request succeeded, reset interval
          requestQueue.resetInterval();
          return data as ApiResponse<T>;

        } catch (error) {
          if (error instanceof ApiClientError) {
            lastError = error;

            // Don't retry non-retryable errors
            if (!this.isRetryableError(error.statusCode)) {
              throw error;
            }

            // Last attempt failed
            if (attempt === MAX_RETRIES) {
              throw error;
            }

            continue;
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

            // Network errors can be retried
            if (attempt < MAX_RETRIES) {
              console.warn(`[API] Network error. Retrying in ${this.getRetryDelay(attempt)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
              await this.sleep(this.getRetryDelay(attempt));
              continue;
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

      // Should not reach here, but throw last error if we do
      if (lastError) throw lastError;
      throw new Error('Unexpected error in request retry loop');
    });
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

// Re-export ApiResponse type for convenience
export type { ApiResponse } from './types';
