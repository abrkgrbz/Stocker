import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, LoginRequest } from '@/shared/types';
import { authApi } from '@/shared/api/auth.api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, TENANT_KEY } from '@/config/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
  setTenant: (tenantId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,

        initializeAuth: () => {
          const token = localStorage.getItem(TOKEN_KEY);
          const state = get();
          
          // If we already have a user and token from persisted state, we're good
          if (state.user && state.token) {
            set({ 
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false 
            });
          } else if (token) {
            // We have a token but no user, need to fetch user data
            get().checkAuth();
          } else {
            // No token, not authenticated
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
            
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
          } catch (error: any) {
            console.error('Login failed:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            
            // Extract detailed error message
            const errorMessage = error.response?.data?.errors?.General?.[0] || 
                               error.response?.data?.message || 
                               error.response?.data || 
                               error.message || 
                               'Login failed';
            
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
              isAuthenticated: false,
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
          } catch (error) {
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

        clearError: () => set({ error: null }),

        setTenant: (tenantId) => {
          localStorage.setItem(TENANT_KEY, tenantId);
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);