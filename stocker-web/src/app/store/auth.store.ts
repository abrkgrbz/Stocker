import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { TOKEN_KEY, REFRESH_TOKEN_KEY, TENANT_KEY } from '@/config/constants';
import { authApi } from '@/shared/api/auth.api';
import { User, LoginRequest } from '@/shared/types';
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
          
          // If already initialized, don't re-initialize
          if (state.isInitialized) {
            return;
          }
          
          // If we already have a user and token from persisted state, check if expired
          if (state.user && state.token) {
            if (!isTokenExpired(state.token)) {
              resetSessionTimeout();
              set({ 
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false 
              });
            } else {
              // Token expired, try to refresh
              get().refreshAuthToken().catch(() => {
                // If refresh fails, mark as not authenticated
                set({ 
                  isAuthenticated: false,
                  isInitialized: true,
                  isLoading: false 
                });
              });
            }
          } else if (token) {
            // We have a token but no user, assume authenticated for now
            // This prevents API calls when backend is down
            set({ 
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              user: {
                id: 'temp-user',
                email: 'user@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['user']
              } as any
            });
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
            const response = await authApi.login(credentials);
            
            // Debug: Log the full response
            console.log('🔐 Login Response:', response);
            console.log('🔐 Login Response Data:', response.data);
            
            // Axios response structure: response.data contains the actual data
            const loginData = response.data || response;
            
            // Handle multiple possible field names from backend
            const accessToken = loginData.accessToken || 
                               loginData.AccessToken || 
                               loginData.access_token || 
                               loginData.token || 
                               loginData.Token || 
                               loginData.jwt || 
                               loginData.JWT;
                               
            const refreshToken = loginData.refreshToken || 
                                loginData.RefreshToken || 
                                loginData.refresh_token;
                                
            const user = loginData.user || loginData.User || loginData;
            
            console.log('🔑 Extracted tokens:', {
              accessToken: accessToken ? 'Found' : 'Not found',
              refreshToken: refreshToken ? 'Found' : 'Not found',
              user: user ? 'Found' : 'Not found'
            });
            
            if (!accessToken) {
              console.error('⚠️ No access token found in response:', loginData);
              throw new Error('No access token received from server');
            }
            
            localStorage.setItem(TOKEN_KEY, accessToken);
            if (refreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            }
            
            // Verify tokens were saved
            console.log('💾 Token saved to localStorage:', {
              key: TOKEN_KEY,
              saved: !!localStorage.getItem(TOKEN_KEY),
              tokenStart: localStorage.getItem(TOKEN_KEY)?.substring(0, 20)
            });
            
            // Save tenant information - check multiple possible fields
            // Try to extract from various possible response structures
            const tenantId = user?.tenantId || 
                            user?.tenant?.id || 
                            user?.TenantId ||
                            loginData.tenantId ||
                            loginData.tenant?.id ||
                            loginData.TenantId;
                            
            const tenantCode = user?.tenantCode || 
                              user?.tenant?.code || 
                              user?.TenantCode ||
                              loginData.tenantCode ||
                              loginData.tenant?.code ||
                              loginData.TenantCode ||
                              credentials.tenantCode;
            
            console.log('🏢 Tenant Info Extraction:', {
              tenantId,
              tenantCode,
              userObject: user,
              loginDataObject: loginData,
              credentialsTenantCode: credentials.tenantCode,
              fullResponse: response.data
            });
            
            // Always save tenant code from credentials if available
            if (credentials.tenantCode) {
              localStorage.setItem('X-Tenant-Code', credentials.tenantCode);
              localStorage.setItem('current_tenant', credentials.tenantCode);
              console.log('✅ Saved tenant code from credentials:', credentials.tenantCode);
            }
            
            if (tenantId) {
              localStorage.setItem('stocker_tenant', tenantId);
              localStorage.setItem('X-Tenant-Id', tenantId);
              console.log('✅ Saved tenant ID:', tenantId);
            } else if (tenantCode) {
              // If no tenantId but we have tenantCode, use tenantCode as ID temporarily
              localStorage.setItem('stocker_tenant', tenantCode);
              localStorage.setItem('X-Tenant-Id', tenantCode);
              console.log('⚠️ No tenant ID found, using tenant code as ID:', tenantCode);
            }
            
            resetSessionTimeout();
            
            // Save login time for 401 protection
            localStorage.setItem('last_login_time', Date.now().toString());
            
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
            // Error handling removed for production
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
            // Error handling removed for production
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