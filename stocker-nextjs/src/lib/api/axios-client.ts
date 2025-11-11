import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Determine API URL based on environment and domain
function getApiUrl(): string {
  // Server-side: always use internal API URL
  if (typeof window === 'undefined') {
    return process.env.API_INTERNAL_URL || 'http://api:5000';
  }

  // Client-side: check if we're on a tenant subdomain
  const hostname = window.location.hostname;
  const isProduction = hostname.includes('stoocker.app');

  if (isProduction) {
    // Production: Always use api.stoocker.app for API requests
    // This avoids CORS issues with tenant subdomains
    return 'https://api.stoocker.app/api';
  }

  // Development: use relative path for Next.js rewrites
  return '/api';
}

const API_URL = getApiUrl();

// Create axios instance with cookie support
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  // Don't set Content-Type here - let interceptor handle it based on data type
  withCredentials: true, // ✅ Enable HttpOnly cookie support
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ NO TOKEN READING - Browser automatically sends HttpOnly cookies
    // Backend will read access_token from cookie

    // Add tenant code from cookie or subdomain
    if (typeof window !== 'undefined' && config.headers) {
      let tenantCode: string | null = null;
      const hostname = window.location.hostname;

      // 1. Try to get tenant-code from cookie (primary source)
      const cookies = document.cookie.split(';');
      const tenantCodeCookie = cookies.find(c => c.trim().startsWith('tenant-code='));

      if (tenantCodeCookie) {
        tenantCode = tenantCodeCookie.split('=')[1]?.trim();
        console.log('🍪 Found tenant-code in cookie:', tenantCode);
      }

      // 2. Fallback: Extract tenant code from subdomain
      if (!tenantCode) {
        const parts = hostname.split('.');

        // If subdomain exists (e.g., abg-tech.stoocker.app)
        if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'auth') {
          tenantCode = parts[0]; // Extract subdomain as tenant code
          console.log('🌐 Extracted tenant-code from subdomain:', tenantCode);
        }
      }

      // 3. Development fallback: Use env variable if localhost
      if (!tenantCode && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        tenantCode = process.env.NEXT_PUBLIC_DEV_TENANT_CODE || null;
        if (tenantCode) {
          console.log('🔧 Using development tenant:', tenantCode);
        }
      }

      // Set tenant code header
      if (tenantCode) {
        config.headers['X-Tenant-Code'] = tenantCode;
        console.log('✅ Tenant Code set:', tenantCode, 'for', config.url);
        console.log('📋 Request headers:', {
          'X-Tenant-Code': config.headers['X-Tenant-Code'],
          'X-Tenant-Id': config.headers['X-Tenant-Id'],
          'Content-Type': config.headers['Content-Type']
        });
      } else {
        console.error('❌ NO TENANT CODE FOUND!');
        console.log('🌐 Hostname:', hostname);
        console.log('🍪 All cookies:', document.cookie);
        console.log('🔍 Cookie array:', cookies);
        console.warn('⚠️ No tenant code found for request:', config.url);
      }

      // Fallback to localStorage for backward compatibility
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId;
      }

      // Set Content-Type based on data type
      // If data is FormData, let axios set multipart/form-data with boundary automatically
      // Otherwise, set application/json as default
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    // Debug logging for POST requests
    if (config.method === 'post' && (config.url?.includes('/opportunities') || config.url?.includes('/deals'))) {
      console.log('📤 POST Request to:', config.url);
      console.log('📦 Request payload:', JSON.stringify(config.data, null, 2));
      console.log('📋 Payload keys:', Object.keys(config.data || {}));
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log all errors for debugging
    if (error.response) {
      console.error('❌ API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: {
          'X-Tenant-Code': originalRequest.headers?.['X-Tenant-Code'],
          'X-Tenant-Id': originalRequest.headers?.['X-Tenant-Id']
        }
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if token is explicitly expired (from backend header)
      const tokenExpired = error.response.headers['token-expired'] === 'true';

      if (tokenExpired) {
        console.warn('🔒 Token expired - forcing logout');
        if (typeof window !== 'undefined') {
          // Clear all auth data
          localStorage.removeItem('tenantId');
          localStorage.removeItem('tenantIdentifier');
          // Clear cookies
          document.cookie.split(";").forEach(c => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // ✅ Try to refresh token using HttpOnly cookie
        // Backend /auth/refresh endpoint will read refresh_token cookie
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {}, // Empty body - token is in HttpOnly cookie
          { withCredentials: true } // Include cookies
        );

        // ✅ Backend sets new access_token cookie automatically
        // Just retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          // Clear any localStorage data
          localStorage.removeItem('tenantId');
          localStorage.removeItem('tenantIdentifier');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
