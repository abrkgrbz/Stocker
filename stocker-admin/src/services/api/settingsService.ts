import { apiClient } from './apiClient';

// DTOs matching backend
export interface SettingsDto {
  general: GeneralSettingsDto;
  email: EmailSettingsDto;
  security: SecuritySettingsDto;
  backup: BackupSettingsDto;
  maintenance: MaintenanceSettingsDto;
  notifications: NotificationSettingsDto;
}

export interface GeneralSettingsDto {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  defaultLanguage: string;
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  maxUploadSize: number;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
}

export interface EmailSettingsDto {
  enableEmail: boolean;
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  smtpEnableSsl: boolean;
  testMode: boolean;
}

export interface SecuritySettingsDto {
  enforcePasswordPolicy: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  enableTwoFactor: boolean;
  enableCaptcha: boolean;
}

export interface BackupSettingsDto {
  enabled: boolean;
  frequency: string;
  time: string;
  retentionDays: number;
  backupLocation: string;
  includeDatabase: boolean;
  includeFiles: boolean;
  emailNotification: boolean;
  notificationEmail: string;
}

export interface MaintenanceSettingsDto {
  enabled: boolean;
  message: string;
  showCountdown: boolean;
  startTime?: string;
  endTime?: string;
}

export interface NotificationSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newUserNotification: boolean;
  newTenantNotification: boolean;
  errorNotification: boolean;
  systemUpdateNotification: boolean;
  reportNotification: boolean;
}

class SettingsService {
  private readonly basePath = '/api/master/settings';

  async getAll(): Promise<SettingsDto> {
    return apiClient.get<SettingsDto>(this.basePath);
  }

  async getByCategory(category: string): Promise<any> {
    return apiClient.get<any>(`${this.basePath}/${category}`);
  }

  async updateGeneral(settings: GeneralSettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/general`, settings);
  }

  async updateEmail(settings: EmailSettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/email`, settings);
  }

  async updateSecurity(settings: SecuritySettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/security`, settings);
  }

  async updateBackup(settings: BackupSettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/backup`, settings);
  }

  async updateMaintenance(settings: MaintenanceSettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/maintenance`, settings);
  }

  async updateNotifications(settings: NotificationSettingsDto): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/notifications`, settings);
  }

  async backupNow(): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/backup-now`);
  }

  async clearCache(): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/clear-cache`);
  }
}

export const settingsService = new SettingsService();
