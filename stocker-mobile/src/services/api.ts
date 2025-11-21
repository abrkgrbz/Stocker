import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { tokenStorage } from '../utils/tokenStorage';
import { API_URL, IS_DEV } from '../constants';
import { Alert } from 'react-native';

// API response type
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});



// Request interceptor
api.interceptors.request.use(
    async (config) => {
        // Add auth token to requests
        const token = await tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

            try {
                const decoded: any = jwtDecode(token);

                if (IS_DEV) {
                    console.log('🔑 [DEBUG] Raw Token:', token);
                    console.log('🔓 [DEBUG] Decoded Token:', decoded);
                }

                const tenantId = decoded.tenantId || decoded.tenant_id || decoded['http://schemas.microsoft.com/identity/claims/tenantid'];

                if (tenantId) {
                    if (IS_DEV) {
                        console.log('🏢 [DEBUG] Extracted TenantId:', tenantId);
                    }
                    config.headers['X-Tenant-Id'] = tenantId;
                } else {
                    if (IS_DEV) {
                        console.warn('⚠️ [DEBUG] No TenantId found in token claims');
                    }
                }
            } catch (e) {
                console.error('❌ [DEBUG] Token decode error:', e);
            }
        }

        // Log request in development
        if (IS_DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Log response in development
        if (IS_DEV) {
            console.log(`[API Response] ${response.config.url}`, response.data);
        }

        // Handle API success response
        if (response.data && response.data.success === false) {
            const errorMessage = response.data.message || 'İşlem başarısız';
            // Alert.alert('Hata', errorMessage); // Optional: don't spam alerts
            return Promise.reject(new Error(errorMessage));
        }

        return response;
    },
    (error: AxiosError<ApiResponse>) => {
        // Log error in development
        if (IS_DEV) {
            console.error('[API Error]', error.response?.data || error.message);
        }

        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear token
                    tokenStorage.clearToken();
                    // Navigation to login should be handled by auth state change
                    break;

                // Let the caller handle these errors with Toast
                case 403:
                case 404:
                case 422:
                case 429:
                case 500:
                case 502:
                case 503:
                    break;

                default:
                // console.error(`Unhandled error status: ${status}`);
            }
        } else if (error.request) {
            // Network error
            // console.error('Network error');
        } else {
            // Other error
            // console.error('Error', error.message);
        }

        return Promise.reject(error);
    }
);

// API methods
export const apiService = {
    // Auth endpoints
    auth: {
        login: (data: { email: string; password: string; tenantCode: string; tenantSignature: string; tenantTimestamp: number }) =>
            api.post<ApiResponse>('/api/auth/login', data, {
                headers: {
                    'X-Tenant-Code': data.tenantCode
                }
            }),

        checkEmail: (email: string) =>
            api.post<ApiResponse>('/api/auth/check-email', { email }),

        verifyEmail: (data: { email: string; code: string }) =>
            api.post<ApiResponse>('/api/auth/verify-email', {
                email: data.email,
                token: data.code
            }),

        resendVerificationEmail: (email: string) =>
            api.post<ApiResponse>('/api/auth/resend-verification-email', { email }),

        register: (data: { email: string; password: string; teamName: string; firstName: string; lastName: string }) =>
            api.post<ApiResponse>('/api/auth/register', data),

        logout: () =>
            api.post<ApiResponse>('/api/auth/logout'),

        refresh: (refreshToken: string) =>
            api.post<ApiResponse>('/api/auth/refresh-token', { refreshToken }),

        me: () =>
            api.get<ApiResponse>('/api/auth/me'),
    },

    // Master endpoints
    master: {
        getDashboardStats: () =>
            api.get<ApiResponse>('/api/master/dashboard/stats'),

        getTenants: (params?: any) =>
            api.get<ApiResponse>('/api/master/tenants', { params }),
    },

    // Tenant endpoints
    tenant: {
        getDashboardStats: () =>
            api.get<ApiResponse>('/api/tenant/dashboard/stats'),
    },

    public: {
        validateEmail: (email: string) =>
            api.post<ApiResponse>('/api/public/validate-email', { email }),

        validateCompanyCode: (code: string) =>
            api.get<ApiResponse>('/api/public/check-company-code/' + code),

        getPackages: () =>
            api.get<ApiResponse>('/api/public/packages'),
    },

    setup: {
        complete: (data: any) =>
            api.post<ApiResponse>('/api/setup/complete', data),
    },
};

export default api;
