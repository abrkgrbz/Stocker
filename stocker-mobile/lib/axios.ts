import axios from 'axios';
import { Platform } from 'react-native';
import { authStorage } from './auth-store';

const getBaseUrl = () => {
    // Get base URL from environment or use default
    let baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.stoocker.app';

    // Ensure /api prefix is present
    if (!baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.replace(/\/$/, '') + '/api';
    }

    return baseUrl;
};

console.log('📡 API Base URL:', getBaseUrl());

export const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token and tenant info
api.interceptors.request.use(
    async (config) => {
        console.log('🌐 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
        try {
            const token = await authStorage.getAccessToken();
            const tenant = await authStorage.getTenant();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (tenant?.code) {
                config.headers['X-Tenant-Code'] = tenant.code;
            }
        } catch (error) {
            console.warn('Auth header error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Token expired - clear auth
            await authStorage.clearAll();
            console.warn('⚠️ Oturum süresi doldu, yeniden giriş yapın');
        } else if (status === 403) {
            console.warn('⚠️ Bu işlem için yetkiniz yok');
        } else if (!error.response) {
            console.error('❌ Sunucuya bağlanılamadı:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
