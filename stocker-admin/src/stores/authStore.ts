import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Swal from 'sweetalert2';
import axiosInstance from '../lib/axios';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  lastLogin?: string;
  avatar?: string;
}

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  refreshAccessToken: () => Promise<void>;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axiosInstance.post(`/api/master/auth/login`, {
            email,
            password,
          });

          const { success, data, message } = response.data;
          
          if (!success) {
            await Swal.fire({
              icon: 'error',
              title: 'Giriş Başarısız',
              text: message || 'Giriş yapılamadı',
              confirmButtonColor: '#d33',
              confirmButtonText: 'Tamam'
            });
            set({
              isLoading: false,
              error: message || 'Login failed',
              isAuthenticated: false,
            });
            return;
          }

          const { accessToken, refreshToken, user } = data;
          
          // Calculate expiration (7 days from now)
          const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
          
          
          set({
            user,
            accessToken,
            refreshToken,
            expiresAt,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          await Swal.fire({
            icon: 'success',
            title: 'Hoş Geldiniz!',
            text: `Merhaba ${user.name}, başarıyla giriş yaptınız.`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Bağlantı hatası oluştu';
          
          await Swal.fire({
            icon: 'error',
            title: 'Giriş Başarısız',
            text: errorMessage,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Tamam'
          });
          
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
        }
      },

      logout: () => {
        
        // Clear state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear local storage
        localStorage.removeItem('stocker-admin-auth');

        Swal.fire({
          icon: 'info',
          title: 'Çıkış Yapıldı',
          text: 'Başarıyla çıkış yaptınız.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },

      checkAuth: async () => {
        const { accessToken, expiresAt, refreshToken } = get();
        
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        // Check if token is expired
        if (expiresAt && Date.now() > expiresAt) {
          // Try to refresh the token
          if (refreshToken) {
            await get().refreshAccessToken();
            return;
          }
          // No refresh token, logout
          get().logout();
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await axiosInstance.get(`/api/master/auth/me`);
          
          if (response.data.success) {
            set({
              user: response.data.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            get().logout();
            set({ isLoading: false });
          }
        } catch (error) {
          // Token is invalid
          if (refreshToken) {
            await get().refreshAccessToken();
          } else {
            get().logout();
            set({ isLoading: false });
          }
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await axiosInstance.post(`/api/master/auth/refresh`, {
            refreshToken,
          });

          const { success, data } = response.data;
          
          if (success && data.accessToken) {
            const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
            
            set({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || refreshToken,
              expiresAt,
              isAuthenticated: true,
            });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'stocker-admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);