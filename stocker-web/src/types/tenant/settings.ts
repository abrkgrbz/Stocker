export interface SettingDto {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  category: string;
  dataType: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SettingCategoryDto {
  category: string;
  description?: string;
  settings: SettingDto[];
}