import { apiClient } from './apiClient';

export interface LoginRequest {
    email: string;
    password?: string;
    twoFactorCode?: string;
    backupCode?: string;
    token?: string; // For refresh or other flows
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
    requiresTwoFactor?: boolean;
    twoFactorType?: string;
    user: UserProfile;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled: boolean;
}

export interface TwoFactorSetupResponse {
    qrCodeUrl: string;
    manualEntryKey: string;
    backupCodes: string[];
}

export interface TwoFactorStatusResponse {
    isEnabled: boolean;
    isVerified: boolean;
    method: string;
}

class AuthService {
    private readonly baseUrl = '/api/master/auth';

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(`${this.baseUrl}/login`, data);
        // @ts-ignore
        return response;
    }

    async refreshToken(token: string, refreshToken: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(`${this.baseUrl}/refresh-token`, { token, refreshToken });
        // @ts-ignore
        return response;
    }

    async logout(): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/logout`);
        // @ts-ignore
        return response.success;
    }

    async check2FaLockout(email: string): Promise<{ isLocked: boolean; remainingSeconds: number }> {
        const response = await apiClient.get(`${this.baseUrl}/check-2fa-lockout`, { params: { email } });
        // @ts-ignore
        return response;
    }

    async verify2Fa(email: string, code: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(`${this.baseUrl}/verify-2fa`, { email, code });
        // @ts-ignore
        return response;
    }

    async verifyBackupCode(email: string, code: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(`${this.baseUrl}/verify-backup-code`, { email, code });
        // @ts-ignore
        return response;
    }

    async verifyEmail(token: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/verify-email`, { token });
        // @ts-ignore
        return response.success;
    }

    async setup2Fa(): Promise<TwoFactorSetupResponse> {
        const response = await apiClient.post<TwoFactorSetupResponse>(`${this.baseUrl}/setup-2fa`);
        // @ts-ignore
        return response;
    }

    async enable2Fa(code: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/enable-2fa`, { code });
        // @ts-ignore
        return response.success;
    }

    async disable2Fa(code: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/disable-2fa`, { code });
        // @ts-ignore
        return response.success;
    }

    async get2FaStatus(): Promise<TwoFactorStatusResponse> {
        const response = await apiClient.get<TwoFactorStatusResponse>(`${this.baseUrl}/2fa-status`);
        // @ts-ignore
        return response;
    }

    async validateToken(): Promise<boolean> {
        try {
            await apiClient.get(`${this.baseUrl}/validate-token`);
            return true;
        } catch {
            return false;
        }
    }

    async me(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(`${this.baseUrl}/me`);
        // @ts-ignore
        return response;
    }
}

export const authService = new AuthService();
