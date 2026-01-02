import * as SecureStore from 'expo-secure-store';

// Secure storage keys
const ACCESS_TOKEN_KEY = 'stocker_access_token';
const REFRESH_TOKEN_KEY = 'stocker_refresh_token';
const USER_KEY = 'stocker_user';
const TENANT_KEY = 'stocker_tenant';

export interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    phone?: string;
    address?: string;
    tenantName?: string;
    createdAt?: string;
}

export interface Tenant {
    code: string;
    name: string;
    domain?: string;
    signature?: string;
    timestamp?: number;
}

export interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

// Token operations
export const authStorage = {
    async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },

    async getRefreshToken(): Promise<string | null> {
        return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    async setUser(user: User): Promise<void> {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },

    async getUser(): Promise<User | null> {
        const data = await SecureStore.getItemAsync(USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    async setTenant(tenant: Tenant): Promise<void> {
        await SecureStore.setItemAsync(TENANT_KEY, JSON.stringify(tenant));
    },

    async getTenant(): Promise<Tenant | null> {
        const data = await SecureStore.getItemAsync(TENANT_KEY);
        return data ? JSON.parse(data) : null;
    },

    async clearAll(): Promise<void> {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        await SecureStore.deleteItemAsync(TENANT_KEY);
    },

    async getAuthState(): Promise<AuthState> {
        const [accessToken, refreshToken, user, tenant] = await Promise.all([
            this.getAccessToken(),
            this.getRefreshToken(),
            this.getUser(),
            this.getTenant(),
        ]);

        return {
            accessToken,
            refreshToken,
            user,
            tenant,
            isAuthenticated: !!accessToken,
        };
    },
};
