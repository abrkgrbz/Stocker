import { apiClient } from './apiClient';

export interface GeneralSettingsDto {
    applicationName: string;
    supportEmail: string;
    defaultLanguage: string;
    defaultTimezone: string;
    maintenanceMode: boolean;
}

export interface SecuritySettingsDto {
    requireTwoFactor: boolean;
    passwordExpirationDays: number;
    minPasswordLength: number;
    requireSpecialChar: boolean;
    requireDigit: boolean;
    requireUppercase: boolean;
    sessionTimeoutMinutes: number;
    maxFailedAccessAttempts: number;
    lockoutDurationMinutes: number;
    allowedIpRanges: string[];
}

export interface EmailSettingsDto {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpSenderName: string;
    enableSsl: boolean;
}

export interface BillingSettingsDto {
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    invoiceFooterText: string;
    dueDays: number;
}

export interface SettingsDto {
    general: GeneralSettingsDto;
    security: SecuritySettingsDto;
    email: EmailSettingsDto;
    billing: BillingSettingsDto;
}

class SettingsService {
    private readonly basePath = '/api/master/settings';

    async getAll(): Promise<SettingsDto> {
        const response = await apiClient.get<SettingsDto>(this.basePath);
        // @ts-ignore
        return response;
    }

    async updateGeneral(settings: GeneralSettingsDto): Promise<SettingsDto> {
        const response = await apiClient.put<SettingsDto>(`${this.basePath}/general`, settings);
        // @ts-ignore
        return response;
    }

    async updateSecurity(settings: SecuritySettingsDto): Promise<SettingsDto> {
        const response = await apiClient.put<SettingsDto>(`${this.basePath}/security`, settings);
        // @ts-ignore
        return response;
    }

    async updateEmail(settings: EmailSettingsDto): Promise<SettingsDto> {
        const response = await apiClient.put<SettingsDto>(`${this.basePath}/email`, settings);
        // @ts-ignore
        return response;
    }

    async updateBilling(settings: BillingSettingsDto): Promise<SettingsDto> {
        const response = await apiClient.put<SettingsDto>(`${this.basePath}/billing`, settings);
        // @ts-ignore
        return response;
    }

    async restoreDefaults(): Promise<SettingsDto> {
        const response = await apiClient.post<SettingsDto>(`${this.basePath}/restore-defaults`);
        // @ts-ignore
        return response;
    }

    async clearCache(): Promise<boolean> {
        const response = await apiClient.post(`${this.basePath}/clear-cache`);
        // @ts-ignore
        return response.success;
    }
}

export const settingsService = new SettingsService();
