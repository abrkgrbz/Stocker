import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { masterSettingsApi } from '@/shared/api/master.api';

// Query Keys
export const settingsKeys = {
  all: ['master', 'settings'] as const,
  general: () => [...settingsKeys.all, 'general'] as const,
  email: () => [...settingsKeys.all, 'email'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  tenant: () => [...settingsKeys.all, 'tenant'] as const,
  maintenance: () => [...settingsKeys.all, 'maintenance'] as const,
  integrations: () => [...settingsKeys.all, 'integrations'] as const,
  backup: () => [...settingsKeys.all, 'backup'] as const,
};

// Get general settings
export const useGetGeneralSettings = () => {
  return useQuery({
    queryKey: settingsKeys.general(),
    queryFn: () => masterSettingsApi.getGeneral(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Update general settings
export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => masterSettingsApi.updateGeneral(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.general() });
      message.success('Genel ayarlar başarıyla güncellendi');
    },
    onError: (error: any) => {
      console.error('Update general settings error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Genel ayarlar güncellenemedi';
      message.error(errorMessage);
    },
  });
};

// Get email settings
export const useGetEmailSettings = () => {
  return useQuery({
    queryKey: settingsKeys.email(),
    queryFn: () => masterSettingsApi.getEmail(),
    staleTime: 10 * 60 * 1000,
  });
};

// Update email settings
export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => masterSettingsApi.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.email() });
      message.success('E-posta ayarları başarıyla güncellendi');
    },
    onError: (error: any) => {
      console.error('Update email settings error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'E-posta ayarları güncellenemedi';
      message.error(errorMessage);
    },
  });
};

// Test email settings
export const useTestEmailSettings = () => {
  return useMutation({
    mutationFn: (email: string) => masterSettingsApi.testEmail(email),
    onSuccess: () => {
      message.success('Test e-postası başarıyla gönderildi');
    },
    onError: (error: any) => {
      console.error('Test email error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Test e-postası gönderilemedi';
      message.error(errorMessage);
    },
  });
};

// Get integrations
export const useGetIntegrations = () => {
  return useQuery({
    queryKey: settingsKeys.integrations(),
    queryFn: () => masterSettingsApi.getIntegrations(),
    staleTime: 10 * 60 * 1000,
  });
};

// Update integration
export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => 
      masterSettingsApi.updateIntegration(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.integrations() });
      message.success('Entegrasyon başarıyla güncellendi');
    },
    onError: (error: any) => {
      console.error('Update integration error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Entegrasyon güncellenemedi';
      message.error(errorMessage);
    },
  });
};

// Get backup settings
export const useGetBackupSettings = () => {
  return useQuery({
    queryKey: settingsKeys.backup(),
    queryFn: () => masterSettingsApi.getBackup(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create backup
export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => masterSettingsApi.createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.backup() });
      message.success('Yedekleme başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      console.error('Create backup error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Yedekleme oluşturulamadı';
      message.error(errorMessage);
    },
  });
};

// Restore backup
export const useRestoreBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (backupId: string) => masterSettingsApi.restoreBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.backup() });
      message.success('Yedekleme başarıyla geri yüklendi');
    },
    onError: (error: any) => {
      console.error('Restore backup error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Yedekleme geri yüklenemedi';
      message.error(errorMessage);
    },
  });
};