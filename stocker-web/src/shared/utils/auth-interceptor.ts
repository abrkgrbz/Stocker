import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '@/services/tokenService';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

export function setupAuthInterceptor(axiosInstance: AxiosInstance) {
  // Request interceptor - add token to headers
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenService.getAccessToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add tenant headers if available (non-sensitive)
      const tenantCode = localStorage.getItem('X-Tenant-Code');
      if (tenantCode && config.headers) {
        config.headers['X-Tenant-Code'] = tenantCode;
      }
      
      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId && config.headers) {
        config.headers['X-Tenant-Id'] = tenantId;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Check if error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          
          const newToken = await tokenService.refreshAccessToken();
          
          isRefreshing = false;
          
          if (newToken) {
            onTokenRefreshed(newToken);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
          } else {
            // Refresh failed, logout and redirect
            await tokenService.logout();
            window.location.href = '/login';
          }
        } else {
          // Wait for token refresh to complete
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosInstance(originalRequest));
            });
          });
        }
      }

      return Promise.reject(error);
    }
  );
}

// Session timeout handler
let sessionTimeout: NodeJS.Timeout | null = null;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function resetSessionTimeout() {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }

  sessionTimeout = setTimeout(async () => {
    // Show warning before logout
    const shouldLogout = window.confirm('Oturumunuz zaman aşımına uğradı. Devam etmek ister misiniz?');
    
    if (!shouldLogout) {
      await tokenService.logout();
      window.location.href = '/login';
    } else {
      // Try to refresh token
      const newToken = await tokenService.refreshAccessToken();
      if (!newToken) {
        await tokenService.logout();
        window.location.href = '/login';
      }
    }
  }, SESSION_TIMEOUT);
}

// Activity tracker
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, resetSessionTimeout);
  });
  
  // Start session timeout
  resetSessionTimeout();
}

// Token expiry checker (uses tokenService)
export function isTokenExpired(): boolean {
  const token = tokenService.getAccessToken();
  return tokenService.isTokenExpired(token || undefined);
}

// Permission checker from token
export function getTokenPermissions(): string[] {
  const token = tokenService.getAccessToken();
  if (!token) return [];
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.permissions || [];
  } catch {
    return [];
  }
}

// Role checker from token
export function getTokenRoles(): string[] {
  const token = tokenService.getAccessToken();
  if (!token) return [];
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || payload.role ? [payload.role] : [];
  } catch {
    return [];
  }
}