import { api } from './client';

export interface SystemSettings {
  general: GeneralSettings;
  email: EmailSettings;
  security: SecuritySettings;
  backup: BackupSettings;
  maintenance: MaintenanceSettings;
  notifications: NotificationSettings;
}

export interface GeneralSettings {
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

export interface EmailSettings {
  provider: 'SMTP' | 'SendGrid' | 'AWS SES' | 'Mailgun';
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  smtpEncryption: 'TLS' | 'SSL' | 'None';
  fromEmail: string;
  fromName: string;
  apiKey?: string;
  testMode: boolean;
}

export interface SecuritySettings {
  enforcePasswordPolicy: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableTwoFactor: boolean;
  sessionTimeout: number;
  enableCaptcha: boolean;
  allowedIpAddresses: string[];
  blockedIpAddresses: string[];
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  backupLocation: string;
  includeDatabase: boolean;
  includeFiles: boolean;
  emailNotification: boolean;
  notificationEmail: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  allowedIPs: string[];
  startTime?: string;
  endTime?: string;
  showCountdown: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newUserNotification: boolean;
  newTenantNotification: boolean;
  errorNotification: boolean;
  systemUpdateNotification: boolean;
  reportNotification: boolean;
  notificationEmails: string[];
}

export const settingsApi = {
  getAll: () => 
    api.get<any>('/api/master/Settings'),
    
  getByCategory: (category: string) => 
    api.get<any>(`/api/master/Settings/${category}`),
    
  updateGeneral: (data: GeneralSettings) => 
    api.put<any>('/api/master/Settings/general', data),
    
  updateEmail: (data: EmailSettings) => 
    api.put<any>('/api/master/Settings/email', data),
    
  updateSecurity: (data: SecuritySettings) => 
    api.put<any>('/api/master/Settings/security', data),
    
  updateBackup: (data: BackupSettings) => 
    api.put<any>('/api/master/Settings/backup', data),
    
  updateMaintenance: (data: MaintenanceSettings) => 
    api.put<any>('/api/master/Settings/maintenance', data),
    
  updateNotifications: (data: NotificationSettings) => 
    api.put<any>('/api/master/Settings/notifications', data),
    
  testEmailSettings: (data: { to: string; subject: string; body: string }) => 
    api.post<any>('/api/master/Settings/test-email', data),
    
  backupNow: () => 
    api.post<any>('/api/master/Settings/backup-now'),
    
  clearCache: () => 
    api.post<any>('/api/master/Settings/clear-cache'),
};