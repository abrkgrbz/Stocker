import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import tokenService, { migrateFromLocalStorage } from '@/services/tokenService';
import { authApi } from '@/shared/api/auth.api';
import { User, LoginRequest } from '@/shared/types';

interface SecureAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastActivity: number;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setTenant: (tenantCode: string) => void;
  updateActivity: () => void;
}

export const useSecureAuthStore = create<SecureAuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,
        lastActivity: Date.now(),

        initializeAuth: async () => {
          const state = get();
          
          // If already initialized, don't re-initialize
          if (state.isInitialized) {
            return;
          }

          set({ isLoading: true });

          try {
            // First, try to migrate from localStorage if needed
            migrateFromLocalStorage();
            
            // Initialize token service (checks cookies)
            await tokenService.initialize();
            
            // If we have a valid token, we're authenticated
            if (tokenService.hasToken() && !tokenService.isTokenExpired()) {
              // Get user data from backend
              await get().checkAuth();
            } else {
              set({ 
                isAuthenticated: false,
                isInitialized: true,
                isLoading: false 
              });
            }
          } catch (error) {
            set({ 
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false 
            });
          }
        },

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authApi.login(credentials);
            const loginData = response.data || response;
            
            // Extract tokens and user data
            const accessToken = loginData.accessToken || 
                               loginData.token || 
                               loginData.jwt;
                               
            const refreshToken = loginData.refreshToken;
            const user = loginData.user || loginData;
            
            if (!accessToken) {
              throw new Error('No access token received from server');
            }
            
            // Store tokens in memory service (not localStorage)
            tokenService.setTokens(accessToken, refreshToken);
            
            // Save non-sensitive tenant info to localStorage
            const tenantCode = user?.tenantCode || 
                              loginData.tenantCode ||
                              credentials.tenantCode;
            
            if (tenantCode) {
              // Tenant code is not sensitive, okay to store
              localStorage.setItem('X-Tenant-Code', tenantCode);
              localStorage.setItem('current_tenant', tenantCode);
            }
            
            // Save tenant ID only if it's a valid GUID
            const tenantId = user?.tenantId || loginData.tenantId;
            if (tenantId) {
              const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              if (guidRegex.test(tenantId)) {
                // Store tenant ID separately (not a token)
                localStorage.setItem('tenant_id', tenantId);
              }
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              lastActivity: Date.now(),
            });
          } catch (error: unknown) {
            // Extract detailed error message
            let errorMessage = 'Login failed';
            if (error && typeof error === 'object' && 'response' in error) {
              const axiosError = error as { response?: { data?: Record<string, unknown> } };
              const data = axiosError.response?.data;
              if (data && typeof data === 'object') {
                const errors = (data as Record<string, unknown>).errors as Record<string, unknown>;
                if (errors?.General && Array.isArray(errors.General)) {
                  errorMessage = (errors.General as string[])[0] || 'Login failed';
                } else if (data.message && typeof data.message === 'string') {
                  errorMessage = data.message;
                }
              }
            } else if (error instanceof Error) {
              errorMessage = error.message || 'Login failed';
            }
            
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            // Call backend logout to clear cookies
            await tokenService.logout();
          } catch (error) {
            // Even if logout fails, clear local state
          } finally {
            // Clear non-sensitive localStorage items
            localStorage.removeItem('X-Tenant-Code');
            localStorage.removeItem('current_tenant');
            localStorage.removeItem('tenant_id');
            localStorage.removeItem('company_setup_complete');
            
            set({
              user: null,
              isAuthenticated: false,
              lastActivity: Date.now(),
            });
          }
        },

        checkAuth: async () => {
          if (!tokenService.hasToken()) {
            set({ 
              isAuthenticated: false, 
              user: null, 
              isLoading: false,
              isInitialized: true 
            });
            return;
          }

          set({ isLoading: true });
          
          try {
            const response = await authApi.getCurrentUser();
            const userData = response.data || response;
            
            // Save tenant ID if available (non-sensitive)
            if (userData?.tenantId) {
              localStorage.setItem('tenant_id', userData.tenantId);
            }
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
          } catch {
            // Auth check failed, clear tokens
            await tokenService.logout();
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
          }
        },

        refreshAuthToken: async () => {
          if (!tokenService.hasToken()) {
            get().logout();
            return;
          }

          set({ isLoading: true });
          
          try {
            const newAccessToken = await tokenService.refreshAccessToken();
            
            if (newAccessToken) {
              set({
                isLoading: false,
                lastActivity: Date.now(),
              });
            } else {
              // Refresh failed
              get().logout();
            }
          } catch (error) {
            // Refresh failed
            get().logout();
          }
        },

        clearError: () => set({ error: null }),

        setTenant: (tenantCode) => {
          // Only store non-sensitive tenant code
          localStorage.setItem('X-Tenant-Code', tenantCode);
          localStorage.setItem('current_tenant', tenantCode);
        },

        updateActivity: () => {
          set({ lastActivity: Date.now() });
        },
      }),
      {
        name: 'secure-auth-storage',
        partialize: (state) => ({
          // Only persist non-sensitive data
          user: state.user,
          lastActivity: state.lastActivity,
          // Don't persist tokens or auth state
        }),
      }
    )
  )
);

// Initialize on app start
if (typeof window !== 'undefined') {
  useSecureAuthStore.getState().initializeAuth();
}