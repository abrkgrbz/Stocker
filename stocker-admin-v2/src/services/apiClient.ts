import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log in development
        if (import.meta.env.DEV) {
            const logData = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, logData || '');
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Handle API success with false logic (common in backend)
        if (response.data && response.data.success === false) {
            const errorMessage = response.data.message || 'İşlem başarısız';
            return Promise.reject(new Error(errorMessage));
        }

        // Return the inner data if it exists, otherwise return the whole response data
        // This handles cases where endpoints strictly follow ApiResponse<T>
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            // @ts-ignore
            return response.data.data;
        }

        return response.data;
    },
    async (error: AxiosError<ApiResponse>) => {
        // Handle 401 Unauthorized - Redirect to Login
        if (error.response?.status === 401) {
            tokenStorage.clearAll();
            // Avoid redirect loops if already on login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        const message = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.join(', ') : error.message) || 'Bir ağ hatası oluştu';

        // Enhanced logging for dev
        if (import.meta.env.DEV) {
            console.error('[API Error]', message, error.response?.data);
        }

        return Promise.reject(new Error(message));
    }
);
