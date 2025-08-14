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
          console.log('initializeAuth called');
          const token = localStorage.getItem(TOKEN_KEY);
          const state = get();
          console.log('Current state:', { user: state.user, token: state.token, hasLocalToken: !!token });
          
          // If we already have a user and token from persisted state, we're good
          if (state.user && state.token) {
            console.log('User and token exist, setting authenticated');
            set({ 
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false 
            });
          } else if (token) {
            // We have a token but no user, need to fetch user data
            console.log('Token exists but no user, checking auth...');
            get().checkAuth();
          } else {
            // No token, not authenticated
            console.log('No token, setting unauthenticated');
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
              isInitialized: true,
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
          console.log('checkAuth called');
          const token = localStorage.getItem(TOKEN_KEY);
          
          if (!token) {
            console.log('No token in checkAuth');
            set({ 
              isAuthenticated: false, 
              user: null, 
              isLoading: false,
              isInitialized: true 
            });
            return;
          }

          console.log('Token found, fetching user...');
          set({ isLoading: true });
          try {
            const response = await authApi.getCurrentUser();
            console.log('User fetch response:', response);
            const userData = response.data || response;
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
          } catch (error) {
            console.error('CheckAuth error:', error);
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