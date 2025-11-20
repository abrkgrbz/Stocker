import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '../utils/tokenStorage';
import { apiService } from '../services/api';
import { Alert } from 'react-native';

interface User {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: string;
    roles?: string[];
    tenantId?: string;
    tenantName?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitializing: boolean;

    // Actions
    login: (data: { email: string; password: string; tenantCode: string; tenantSignature: string; tenantTimestamp: number }) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            isInitializing: true,

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            login: async (data) => {
                set({ isLoading: true });

                try {
                    const response = await apiService.auth.login(data);

                    if (response.data?.success) {
                        const { accessToken, refreshToken, user } = response.data.data;

                        // Map user data
                        const appUser: User = {
                            id: user.id,
                            email: user.email,
                            name: `${user.firstName} ${user.lastName}`.trim() || 'User',
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.roles?.[0] || 'user',
                            roles: user.roles,
                            tenantId: user.tenantId,
                            tenantName: user.tenantName,
                        };

                        // Store tokens
                        await tokenStorage.setToken(accessToken);
                        if (refreshToken) {
                            await tokenStorage.setRefreshToken(refreshToken);
                        }

                        set({
                            user: appUser,
                            accessToken,
                            refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        throw new Error(response.data?.message || 'Login failed');
                    }
                } catch (error: any) {
                    set({ isLoading: false });
                    console.error('Login error:', error);
                    // Alert.alert('Giriş Hatası', error.message || 'Giriş yapılamadı');
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await apiService.auth.logout();
                } catch (error) {
                    console.error('Logout API error:', error);
                }

                await tokenStorage.clearToken();
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            checkAuth: async () => {
                try {
                    const token = await tokenStorage.getToken();
                    if (token) {
                        // Optionally verify token with /me endpoint
                        set({ isAuthenticated: true, accessToken: token });
                    } else {
                        set({ isAuthenticated: false, accessToken: null });
                    }
                } finally {
                    set({ isInitializing: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // Don't persist tokens to AsyncStorage, they are handled by SecureStore
            }),
        }
    )
);
