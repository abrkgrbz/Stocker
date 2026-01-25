import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import logger from '../utils/logger';
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
        logger.info('🍪 Found tenant-code in cookie', { metadata: { tenantCode } });
      }

      // 2. Fallback: Extract tenant code from subdomain
      if (!tenantCode) {
        const parts = hostname.split('.');

        // If subdomain exists (e.g., abg-tech.stoocker.app)
        if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'auth') {
          tenantCode = parts[0]; // Extract subdomain as tenant code
          logger.info('🌐 Extracted tenant-code from subdomain', { metadata: { tenantCode } });
        }
      }

      // 3. Development fallback: Use env variable if localhost
      if (!tenantCode && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        tenantCode = process.env.NEXT_PUBLIC_DEV_TENANT_CODE || null;
        if (tenantCode) {
          logger.info('🔧 Using development tenant', { metadata: { tenantCode } });
        }
      }

      // Set tenant code header
      if (tenantCode) {
        config.headers['X-Tenant-Code'] = tenantCode;
        logger.info('✅ Tenant Code set', { metadata: { tenantCode, url: config.url } });
        console.log('📋 Request headers:', {
          'X-Tenant-Code': config.headers['X-Tenant-Code'],
          'Content-Type': config.headers['Content-Type']
        });
      } else {
        logger.error('❌ NO TENANT CODE FOUND!');
        logger.info('🌐 Hostname', { metadata: { hostname } });
        logger.info('🍪 All cookies', { metadata: { cookies: document.cookie } });
        logger.info('🔍 Cookie array', { metadata: { cookies } });
        logger.warn('⚠️ No tenant code found for request', { metadata: { url: config.url } });
      }

      // ❌ REMOVED: X-Tenant-Id from localStorage causes conflicts
      // Backend uses token + X-Tenant-Code for authorization
      // Old tenantId in localStorage was causing "Tenant.Unauthorized" errors

      // Clean up old localStorage data if tenant-code exists in cookie
      if (tenantCode && typeof window !== 'undefined') {
        const storedTenantId = localStorage.getItem('tenantId');
        const storedTenantIdentifier = localStorage.getItem('tenantIdentifier');

        // If we have a different tenant-code in cookie, clear old localStorage data
        if (storedTenantId || storedTenantIdentifier) {
          logger.warn('🧹 Clearing old localStorage tenant data');
          localStorage.removeItem('tenantId');
          localStorage.removeItem('tenantIdentifier');
        }
      }

      // Set Content-Type based on data type
      // If data is FormData, let axios set multipart/form-data with boundary automatically
      // Otherwise, set application/json as default
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }

      // Disable browser caching to ensure fresh data after mutations
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
    }

    // Debug logging for POST requests
    if (config.method === 'post' && (config.url?.includes('/opportunities') || config.url?.includes('/deals') || config.url?.includes('/leads'))) {
      logger.info('📤 POST Request', { metadata: { url: config.url } });
      logger.info('📦 Request payload', { metadata: { payload: JSON.stringify(config.data, null, 2) } });
      logger.info('📋 Payload keys', { metadata: { keys: Object.keys(config.data || {}) } });

      // Special logging for leads to debug validation errors
      if (config.url?.includes('/leads')) {
        const leadData = (config.data as any)?.LeadData;
        logger.info('🔍 LeadData object', { metadata: { leadData } });
        logger.info('🔍 LeadData keys', { metadata: { keys: leadData ? Object.keys(leadData) : 'LeadData is null/undefined' } });
        logger.info('🔍 firstName', { metadata: { firstName: leadData?.firstName } });
        logger.info('🔍 lastName', { metadata: { lastName: leadData?.lastName } });
        logger.info('🔍 email', { metadata: { email: leadData?.email } });
      }
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
          'X-Tenant-Code': originalRequest.headers?.['X-Tenant-Code']
        }
      });
    }

    // Handle Tenant.Unauthorized (400) - Token tenant mismatch
    if (error.response?.status === 400 && (error.response?.data as any)?.code === 'Tenant.Unauthorized') {
      logger.error('🔒 Tenant mismatch - access token belongs to different tenant');
      console.error('🔍 Debug info:', {
        'Current tenant-code (from cookie)': document.cookie.split(';').find(c => c.trim().startsWith('tenant-code='))?.split('=')[1],
        'Subdomain': window.location.hostname.split('.')[0],
        'Request URL': originalRequest.url,
        'Error response': error.response.data
      });

      // TEMPORARILY DISABLED AUTO-LOGOUT FOR DEBUGGING
      logger.warn('⚠️ Auto-logout disabled for debugging. Please check backend token tenant.');

      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if token is explicitly expired (from backend header)
      const tokenExpired = error.response.headers['token-expired'] === 'true';

      if (tokenExpired) {
        logger.warn('🔒 Token expired - forcing logout');
        if (typeof window !== 'undefined') {
          // Clear all auth data
          localStorage.removeItem('tenantId');
          localStorage.removeItem('tenantIdentifier');

          // Clear auth cookies (but keep tenant-code!)
          document.cookie.split(";").forEach(c => {
            const cookieName = c.trim().split('=')[0];
            // Only clear auth-related cookies, preserve tenant-code
            if (cookieName !== 'tenant-code') {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            }
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
          // Check for auth bypass
          // const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
          const isAuthBypassed = true; // Hardcoded for debugging

          if (!isAuthBypassed) {
            // Clear any localStorage data
            localStorage.removeItem('tenantId');
            localStorage.removeItem('tenantIdentifier');
            window.location.href = '/login';
          } else {
            console.warn('🔓 [Axios] Auth bypass active - suppressing 401 redirect');
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
