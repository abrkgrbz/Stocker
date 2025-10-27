import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any | null; // Replace 'any' with a proper user type
  isAuthenticated: boolean;
  initializeAuth: () => Promise<void>;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userString = await AsyncStorage.getItem('user');
      if (token && userString) {
        const user = JSON.parse(userString);
        set({ token, user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  },
  login: async (token: string, user: any) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },
}));