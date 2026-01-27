import { apiClient } from './apiClient';

export interface GeneralSettingsDto {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
}

export interface SecuritySettingsDto {
    enforcePasswordPolicy: boolean;
    minPasswordLength: number;
    enableTwoFactor: boolean;
    sessionTimeout: number;
}

export interface SettingsDto {
    general: GeneralSettingsDto;
    security: SecuritySettingsDto;
}

class SettingsService {
    private readonly basePath = '/api/master/settings';

    async getAll(): Promise<SettingsDto> {
        const response = await apiClient.get<SettingsDto>(this.basePath);
        // @ts-ignore
        return response;
    }

    async updateGeneral(settings: GeneralSettingsDto): Promise<boolean> {
        const response = await apiClient.put(`${this.basePath}/general`, settings);
        // @ts-ignore
        return response.success;
    }

    async updateSecurity(settings: SecuritySettingsDto): Promise<boolean> {
        const response = await apiClient.put(`${this.basePath}/security`, settings);
        // @ts-ignore
        return response.success;
    }

    async clearCache(): Promise<boolean> {
        const response = await apiClient.post(`${this.basePath}/clear-cache`);
        // @ts-ignore
        return response.success;
    }
}

export const settingsService = new SettingsService();
