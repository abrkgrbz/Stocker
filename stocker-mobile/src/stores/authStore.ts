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
    updateProfile: (data: { firstName: string; lastName: string; email: string }) => Promise<void>;
    completeSetup: () => void;

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

            updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await apiService.auth.updateProfile(data);
                    if (response.data?.success) {
                        const updatedUser = response.data.data;
                        set((state) => ({
                            user: {
                                ...state.user!,
                                ...updatedUser
                            },
                            isLoading: false
                        }));
                    }
                } catch (error) {
                    set({ isLoading: false });
                    console.error('Update profile error:', error);
                    throw error;
                }
            },

            completeSetup: () => {
                set((state) => ({
                    user: state.user ? { ...state.user, requiresSetup: false } : null
                }));
            },

            checkAuth: async () => {
                console.log('🔐 [AuthStore] checkAuth started');
                try {
                    const token = await tokenStorage.getToken();
                    console.log('🔐 [AuthStore] Token retrieved:', token ? 'Yes' : 'No');

                    if (token) {
                        // Verify token and get latest user data
                        try {
                            console.log('🔐 [AuthStore] Verifying token with API...');
                            const response = await apiService.auth.me();
                            console.log('🔐 [AuthStore] API Response success:', response.data.success);

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
                                console.log('🔐 [AuthStore] User authenticated');
                            } else {
                                // Token invalid or expired
                                console.warn('🔐 [AuthStore] Token validation failed');
                                throw new Error('Token validation failed');
                            }
                        } catch (error) {
                            console.error('🔐 [AuthStore] Auth check failed:', error);
                            // If API call fails (e.g. 401), clear auth
                            await tokenStorage.clearToken();
                            set({ isAuthenticated: false, accessToken: null, user: null });
                        }
                    } else {
                        console.log('🔐 [AuthStore] No token found');
                        set({ isAuthenticated: false, accessToken: null });
                    }
                } finally {
                    console.log('🔐 [AuthStore] Initialization complete');
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
