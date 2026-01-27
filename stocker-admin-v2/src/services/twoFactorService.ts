import { apiClient } from './apiClient';

export interface TwoFactorSetupDto {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
    backupCodes: string[];
}

export interface TwoFactorStatusDto {
    enabled: boolean;
    method: '2fa' | 'sms' | 'email' | null;
    backupCodesRemaining?: number;
}

class TwoFactorService {
    private readonly basePath = '/api/master/auth';

    async get2FAStatus(): Promise<TwoFactorStatusDto> {
        const response = await apiClient.get<{ enabled: boolean; backupCodesRemaining: number }>(`${this.basePath}/2fa-status`);
        // @ts-ignore
        const data = response.data || response;
        return {
            enabled: data.enabled || false,
            method: data.enabled ? '2fa' : null,
            backupCodesRemaining: data.backupCodesRemaining
        };
    }

    async setupTwoFactor(): Promise<TwoFactorSetupDto> {
        const response = await apiClient.post<TwoFactorSetupDto>(`${this.basePath}/setup-2fa`, {});
        // @ts-ignore
        return response;
    }

    async enable2FA(secret: string, token: string, backupCodes: string[]): Promise<boolean> {
        const response = await apiClient.post(`${this.basePath}/enable-2fa`, {
            verificationCode: token,
            secret,
            backupCodes
        });
        // @ts-ignore
        return response.success;
    }

    async disable2FA(password: string): Promise<boolean> {
        const response = await apiClient.post(`${this.basePath}/disable-2fa`, {
            code: password
        });
        // @ts-ignore
        return response.success;
    }

    async regenerateBackupCodes(password: string): Promise<string[]> {
        const response = await apiClient.post<{ backupCodes: string[] }>(`${this.basePath}/2fa/regenerate-backup-codes`, {
            password
        });
        // @ts-ignore
        return response.backupCodes || [];
    }

    async verifyLoginToken(token: string): Promise<boolean> {
        const response = await apiClient.post('/api/auth/2fa/verify', { token });
        // @ts-ignore
        return response.success;
    }
}

export const twoFactorService = new TwoFactorService();
