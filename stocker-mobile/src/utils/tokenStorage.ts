import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Helper to handle web vs native storage if needed, 
// though SecureStore handles web (unencrypted) automatically.
// We can add specific options for SecureStore here if needed.

export const tokenStorage = {
    getToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    setToken: async (token: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },

    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    },

    setRefreshToken: async (token: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error setting refresh token:', error);
        }
    },

    clearToken: async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    },
};
