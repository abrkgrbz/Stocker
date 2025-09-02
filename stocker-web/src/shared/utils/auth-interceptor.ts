import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/constants';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<TokenResponse>('/api/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    
    return accessToken;
  } catch (error) {
    // Refresh failed, clear tokens
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
}

export function setupAuthInterceptor(axiosInstance: AxiosInstance) {
  // Request interceptor - add token to headers
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
          
          const newToken = await refreshAccessToken();
          
          isRefreshing = false;
          
          if (newToken) {
            onTokenRefreshed(newToken);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
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

  sessionTimeout = setTimeout(() => {
    // Show warning before logout
    const shouldLogout = window.confirm('Oturumunuz zaman aşımına uğradı. Devam etmek ister misiniz?');
    
    if (!shouldLogout) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = '/login';
    } else {
      refreshAccessToken();
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

// Token expiry checker
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > exp;
  } catch {
    return true;
  }
}

// Permission checker from token
export function getTokenPermissions(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.permissions || [];
  } catch {
    return [];
  }
}

// Role checker from token
export function getTokenRoles(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || payload.role ? [payload.role] : [];
  } catch {
    return [];
  }
}