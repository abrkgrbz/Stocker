import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, LoginRequest } from '@/shared/types';
import { authApi } from '@/shared/api/auth.api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, TENANT_KEY } from '@/config/constants';
import { isTokenExpired, resetSessionTimeout } from '@/shared/utils/auth-interceptor';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
  initializeAuth: () => void;
  clearError: () => void;
  setTenant: (tenantId: string) => void;
  updateActivity: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,
        lastActivity: Date.now(),

        initializeAuth: () => {
          const token = localStorage.getItem(TOKEN_KEY);
          const state = get();
          
          console.log('[AuthStore] initializeAuth called:', {
            hasToken: !!token,
            hasUser: !!state.user,
            hasStateToken: !!state.token,
            userRoles: state.user?.roles
          });
          
          // If we already have a user and token from persisted state, check if expired
          if (state.user && state.token) {
            if (!isTokenExpired(state.token)) {
              console.log('[AuthStore] Already authenticated from persisted state');
              resetSessionTimeout();
              set({ 
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false 
              });
            } else {
              console.log('[AuthStore] Token expired, attempting refresh');
              get().refreshAuthToken();
            }
          } else if (token) {
            // We have a token but no user, need to fetch user data
            console.log('[AuthStore] Token found but no user, fetching user data...');
            get().checkAuth();
          } else {
            // No token, not authenticated
            console.log('[AuthStore] No authentication found');
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
            console.log('Login attempt with:', { email: credentials.email, tenantCode: credentials.tenantCode });
            
            const response = await authApi.login(credentials);
            
            // Axios response structure: response.data contains the actual data
            const loginData = response.data || response;
            
            // Handle both camelCase and PascalCase field names from backend
            const accessToken = loginData.accessToken || loginData.AccessToken;
            const refreshToken = loginData.refreshToken || loginData.RefreshToken;
            const user = loginData.user || loginData.User;
            
            console.log('Login response:', loginData);
            console.log('Extracted token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN');
            console.log('Login successful, user:', user);
            
            localStorage.setItem(TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            
            // Save tenant ID if available
            if (user?.tenantId) {
              localStorage.setItem('stocker_tenant', user.tenantId);
              console.log('Tenant ID saved:', user.tenantId);
            } else if (user?.tenant?.id) {
              localStorage.setItem('stocker_tenant', user.tenant.id);
              console.log('Tenant ID saved from tenant object:', user.tenant.id);
            }
            
            resetSessionTimeout();
            
            set({
              user,
              token: accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              lastActivity: Date.now(),
            });
          } catch (error: unknown) {
            console.error('Login failed:', error);
            
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
                } else {
                  errorMessage = String(data) || 'Login failed';
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
            await authApi.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(TENANT_KEY);
            
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              lastActivity: Date.now(),
            });
          }
        },

        checkAuth: async () => {
          const token = localStorage.getItem(TOKEN_KEY);
          
          if (!token) {
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
            
            // Save tenant ID if available
            if (userData?.tenantId) {
              localStorage.setItem('stocker_tenant', userData.tenantId);
            } else if (userData?.tenant?.id) {
              localStorage.setItem('stocker_tenant', userData.tenant.id);
            }
            
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
          } catch {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
          }
        },

        refreshAuthToken: async () => {
          const refreshTokenValue = get().refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
          
          if (!refreshTokenValue) {
            get().logout();
            return;
          }

          set({ isLoading: true });
          try {
            const response = await authApi.refreshToken(refreshTokenValue);
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            localStorage.setItem(TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            resetSessionTimeout();
            
            set({
              token: accessToken,
              refreshToken: newRefreshToken,
              isLoading: false,
              lastActivity: Date.now(),
            });
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().logout();
          }
        },

        clearError: () => set({ error: null }),

        setTenant: (tenantId) => {
          localStorage.setItem(TENANT_KEY, tenantId);
        },

        updateActivity: () => {
          set({ lastActivity: Date.now() });
          resetSessionTimeout();
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity,
        }),
      }
    )
  )
);