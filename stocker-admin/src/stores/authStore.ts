import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Swal from 'sweetalert2';
import { tokenStorage } from '../utils/tokenStorage';
import { auditLogger } from '../utils/auditLogger';
import { apiClient } from '../services/api/apiClient';
import { AppError, ERROR_CODES } from '../services/errorService';
import { STORAGE_KEYS } from '../constants';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  roles?: string[];  // Keep original roles array from API
  tenantId?: string;
  tenantName?: string;
}

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempLoginToken: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  verify2FA: (code: string) => Promise<boolean>;
  verifyBackupCode: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  setLoading: (loading: boolean) => void;
  clearTempToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempLoginToken: null,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearTempToken: () => {
        set({ tempLoginToken: null, requires2FA: false });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Use real API client
          const response = await apiClient.login({ email, password });

          // Check if 2FA is required
          if (response.requires2FA) {
            set({
              isLoading: false,
              requires2FA: true,
              tempLoginToken: response.tempToken,
              user: {
                id: '',
                email: email,
                name: '',
                role: 'user'
              }
            });

            // Don't show success message yet, wait for 2FA
            return;
          }

          // Map the API user format to our admin user format
          const adminUser: AdminUser = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.fullName || response.user.username || 'Admin User',
            role: response.user.roles.includes('SistemYoneticisi') || response.user.roles.includes('SystemAdmin') ? 'super_admin' :
                  response.user.roles.includes('Admin') ? 'admin' : 'user',
            roles: response.user.roles,  // Keep original roles array
            tenantId: response.user.tenantId,
            tenantName: response.user.tenantName,
          };

          // Store tokens securely
          tokenStorage.setToken(response.accessToken);
          tokenStorage.setRefreshToken(response.refreshToken);

          // Update state
          set({
            user: adminUser,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
            tempLoginToken: null
          });

          // Log successful login
          auditLogger.logLogin(adminUser.email, true);

          // Success message will be shown by LoginPage.tsx
          // No need to show here as it might interfere with 2FA flow
        } catch (error: any) {
          set({ isLoading: false, requires2FA: false, tempLoginToken: null });

          // Log failed login attempt
          auditLogger.logLogin(email, false, error.message);

          // Show error message
          const errorMessage = error.message || 'Giriş başarısız oldu';

          await Swal.fire({
            icon: 'error',
            title: 'Giriş Hatası',
            text: errorMessage,
            confirmButtonText: 'Tamam',
            background: '#1a1f36',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'colored-toast',
              title: 'swal-title',
            },
            didOpen: (popup) => {
              popup.style.border = '2px solid #ef4444';
              popup.style.boxShadow = '0 10px 40px rgba(239, 68, 68, 0.3)';
            }
          });

          throw error;
        }
      },

      verify2FA: async (code: string) => {
        const state = get();
        const tempToken = state.tempLoginToken;
        const userEmail = state.user?.email;

        if (!tempToken || !userEmail) return false;

        set({ isLoading: true });

        try {
          const response = await apiClient.verify2FA({
            email: userEmail,
            tempToken,
            code
          });

          if (response.success && response.data) {
            // Map the API user format to our admin user format
            const adminUser: AdminUser = {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.fullName || response.data.user.username || 'Admin User',
              role: response.data.user.roles.includes('SistemYoneticisi') || response.data.user.roles.includes('SystemAdmin') ? 'super_admin' :
                    response.data.user.roles.includes('Admin') ? 'admin' : 'user',
              roles: response.data.user.roles,
              tenantId: response.data.user.tenantId,
              tenantName: response.data.user.tenantName,
            };

            // Store tokens securely
            tokenStorage.setToken(response.data.accessToken);
            tokenStorage.setRefreshToken(response.data.refreshToken);

            // Update state
            set({
              user: adminUser,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              requires2FA: false,
              tempLoginToken: null
            });

            // Log successful 2FA verification
            auditLogger.logLogin(adminUser.email, true, '2FA verified');

            return true;
          }
          return false;
        } catch (error: any) {
          set({ isLoading: false });
          console.error('2FA verification failed:', error);
          return false;
        }
      },

      verifyBackupCode: async (code: string) => {
        const state = get();
        const tempToken = state.tempLoginToken;
        const userEmail = state.user?.email;

        if (!tempToken || !userEmail) return false;

        set({ isLoading: true });

        try {
          const response = await apiClient.verifyBackupCode({
            email: userEmail,
            tempToken,
            code
          });

          if (response.success && response.data) {
            // Map the API user format to our admin user format
            const adminUser: AdminUser = {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.fullName || response.data.user.username || 'Admin User',
              role: response.data.user.roles.includes('SistemYoneticisi') || response.data.user.roles.includes('SystemAdmin') ? 'super_admin' :
                    response.data.user.roles.includes('Admin') ? 'admin' : 'user',
              roles: response.data.user.roles,
              tenantId: response.data.user.tenantId,
              tenantName: response.data.user.tenantName,
            };

            // Store tokens securely
            tokenStorage.setToken(response.data.accessToken);
            tokenStorage.setRefreshToken(response.data.refreshToken);

            // Update state
            set({
              user: adminUser,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              requires2FA: false,
              tempLoginToken: null
            });

            // Log successful backup code usage
            auditLogger.logLogin(adminUser.email, true, 'Backup code used');

            return true;
          }
          return false;
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Backup code verification failed:', error);
          return false;
        }
      },

      logout: async () => {
        const user = get().user;
        
        try {
          // Call logout API
          await apiClient.logout();
        } catch (error) {
          // Log error but continue with local logout
          console.error('Logout API call failed:', error);
        }
        
        // Clear local state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        
        // Clear tokens from secure storage
        tokenStorage.clearToken();
        
        // Log logout
        if (user) {
          auditLogger.logLogout(user.email);
        }
        
        // Show logout notification
        await Swal.fire({
          icon: 'info',
          title: 'Çıkış Yapıldı',
          text: 'Güvenli bir şekilde çıkış yaptınız.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top',
          background: '#1a1f36',
          color: '#fff',
          customClass: {
            popup: 'colored-toast',
            title: 'swal-title',
            timerProgressBar: 'swal-progress-bar'
          },
          didOpen: (toast) => {
            toast.style.border = '2px solid #667eea';
            toast.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.3)';
          }
        });
      },

      checkAuth: () => {
        const state = get();
        // Check both state and secure storage
        const storedToken = tokenStorage.getToken();
        const storedRefreshToken = tokenStorage.getRefreshToken();
        
        if (!state.accessToken && !storedToken) {
          set({ isAuthenticated: false });
        } else if (storedToken && !state.accessToken) {
          // Restore tokens from secure storage if available
          set({ 
            accessToken: storedToken,
            refreshToken: storedRefreshToken,
            isAuthenticated: true 
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);