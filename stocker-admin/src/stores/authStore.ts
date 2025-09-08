import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Swal from 'sweetalert2';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('https://api.stoocker.app/api/master/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
          
          if (data.success && data.data) {
            const { accessToken, user } = data.data;
            
            set({
              user,
              accessToken,
              isAuthenticated: true,
            });
          } else {
            throw new Error(data.message || 'Login failed');
          }
        } catch (error) {
          // For development, allow mock login
          if (email === 'admin@stocker.app' && password === 'admin123') {
            set({
              user: {
                id: '1',
                email: 'admin@stocker.app',
                name: 'Admin User',
                role: 'super_admin',
              },
              accessToken: 'mock-token',
              isAuthenticated: true,
            });
          } else {
            throw error;
          }
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        
        // Çıkış bildirimi
        Swal.fire({
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
        if (!state.accessToken) {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);