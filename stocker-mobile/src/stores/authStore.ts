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
    requiresSetup?: boolean;
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
    updateUser: (user: User) => void;

    // Biometrics
    biometricEnabled: boolean;
    setBiometricEnabled: (enabled: boolean) => void;
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

            updateUser: (user: User) => {
                set({ user });
            },

            biometricEnabled: false,
            setBiometricEnabled: (enabled: boolean) => {
                set({ biometricEnabled: enabled });
            },

            login: async (data) => {
                set({ isLoading: true });

                try {
                    const response = await apiService.auth.login(data);

                    if (response.data?.success) {
                        const { accessToken, refreshToken, user, requiresSetup } = response.data.data;

                        console.log('🔑 [DEBUG] Login Success - Access Token:', accessToken);

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
                            requiresSetup: requiresSetup || false,
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
                        // Verify token and get latest user data
                        try {
                            const response = await apiService.auth.me();
                            if (response.data.success) {
                                const userData = response.data.data;
                                // Update user store with latest data
                                set((state) => ({
                                    isAuthenticated: true,
                                    accessToken: token,
                                    user: {
                                        ...state.user!,
                                        ...userData,
                                        // Ensure requiresSetup is updated from server
                                        requiresSetup: userData.requiresSetup
                                    }
                                }));
                            } else {
                                // Token invalid or expired
                                throw new Error('Token validation failed');
                            }
                        } catch (error) {
                            console.error('Auth check failed:', error);
                            // If API call fails (e.g. 401), clear auth
                            await tokenStorage.clearToken();
                            set({ isAuthenticated: false, accessToken: null, user: null });
                        }
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
                biometricEnabled: state.biometricEnabled,
                // Don't persist tokens to AsyncStorage, they are handled by SecureStore
            }),
        }
    )
);
