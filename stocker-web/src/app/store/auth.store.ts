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
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setTenant: (tenantId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            console.log('Login request:', credentials);
            const response = await authApi.login(credentials);
            console.log('Login response:', response);
            
            // Axios response structure: response.data contains the actual data
            const loginData = response.data || response;
            const { accessToken, refreshToken, user } = loginData;
            
            localStorage.setItem(TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response);
            set({
              error: error.response?.data?.message || error.message || 'Login failed',
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
            set({ isAuthenticated: false, user: null });
            return;
          }

          set({ isLoading: true });
          try {
            const response = await authApi.getCurrentUser();
            const userData = response.data || response;
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
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