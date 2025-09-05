import api from '../api';
import { SettingCategoryDto, SettingDto } from '../../types/tenant/settings';

export interface CreateSettingRequest {
  settingKey: string;
  settingValue: string;
  description?: string;
  category?: string;
  dataType?: string;
  isSystemSetting?: boolean;
  isEncrypted?: boolean;
  isPublic?: boolean;
}

export interface UpdateSettingRequest {
  settingValue: string;
}

class TenantSettingsService {
  private baseUrl = '/api/tenant/settings';

  async getSettings(category?: string, includeSystemSettings = false): Promise<SettingCategoryDto[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    params.append('includeSystemSettings', includeSystemSettings.toString());

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  async getSettingByKey(key: string): Promise<SettingDto | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${key}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createSetting(request: CreateSettingRequest): Promise<SettingDto> {
    const response = await api.post(this.baseUrl, request);
    return response.data.data;
  }

  async updateSetting(key: string, request: UpdateSettingRequest): Promise<boolean> {
    const response = await api.put(`${this.baseUrl}/${key}`, request);
    return response.data.data;
  }

  async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.getSettingByKey(key);
    return setting?.settingValue || null;
  }

  async updateSettingValue(key: string, value: string): Promise<boolean> {
    return this.updateSetting(key, { settingValue: value });
  }
}

export default new TenantSettingsService();