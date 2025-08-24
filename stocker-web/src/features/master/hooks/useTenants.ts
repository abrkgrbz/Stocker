import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { masterTenantApi } from '@/shared/api/master.api';
import { Tenant, CreateTenantRequest } from '@/shared/types';

// Query Keys
export const tenantKeys = {
  all: ['master', 'tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params?: any) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
  usage: (id: string) => [...tenantKeys.all, 'usage', id] as const,
  activity: (id: string) => [...tenantKeys.all, 'activity', id] as const,
};

// Get all tenants
export const useGetTenants = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => masterTenantApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get tenant by ID
export const useGetTenant = (id: string) => {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => masterTenantApi.getById(id),
    enabled: !!id,
  });
};

// Get tenant usage stats
export const useGetTenantUsage = (id: string) => {
  return useQuery({
    queryKey: tenantKeys.usage(id),
    queryFn: () => masterTenantApi.getUsageStats(id),
    enabled: !!id,
  });
};

// Get tenant activity log
export const useGetTenantActivity = (id: string) => {
  return useQuery({
    queryKey: tenantKeys.activity(id),
    queryFn: () => masterTenantApi.getActivityLog(id),
    enabled: !!id,
  });
};

// Create tenant
export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTenantRequest) => masterTenantApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      message.success('Tenant başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tenant oluşturulamadı');
    },
  });
};

// Update tenant
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) =>
      masterTenantApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) });
      message.success('Tenant başarıyla güncellendi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tenant güncellenemedi');
    },
  });
};

// Delete tenant
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => masterTenantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      message.success('Tenant başarıyla silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tenant silinemedi');
    },
  });
};

// Suspend tenant
export const useSuspendTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => {
      console.log('Suspending tenant:', id, 'Reason:', reason);
      return masterTenantApi.suspend(id, reason);
    },
    onSuccess: (data, variables) => {
      console.log('Tenant suspended successfully:', data);
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) });
      message.success('Tenant başarıyla askıya alındı');
    },
    onError: (error: any) => {
      console.error('Suspend tenant error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Tenant askıya alınamadı';
      message.error(errorMessage);
    },
  });
};

// Activate tenant
export const useActivateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      console.log('Activating tenant:', id);
      return masterTenantApi.activate(id);
    },
    onSuccess: (data, id) => {
      console.log('Tenant activated successfully:', data);
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) });
      message.success('Tenant başarıyla aktifleştirildi');
    },
    onError: (error: any) => {
      console.error('Activate tenant error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Tenant aktifleştirilemedi';
      message.error(errorMessage);
    },
  });
};

// Reset tenant password
export const useResetTenantPassword = () => {
  return useMutation({
    mutationFn: (id: string) => masterTenantApi.resetPassword(id),
    onSuccess: () => {
      message.success('Şifre sıfırlama linki gönderildi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Şifre sıfırlama linki gönderilemedi');
    },
  });
};

// Login as tenant (impersonate) - NOT IMPLEMENTED IN BACKEND YET
export const useLoginAsTenant = () => {
  return useMutation({
    mutationFn: (id: string) => masterTenantApi.loginAsTenant(id),
    onSuccess: (data) => {
      console.log('Login as tenant - Feature not implemented in backend');
      message.warning('Tenant olarak giriş özelliği henüz backend\'de implemente edilmemiş. Bu özellik yakında eklenecek.');
      
      // For now, just show a message
      if (data?.data?.data?.message) {
        message.info(data.data.data.message);
      }
    },
    onError: (error: any) => {
      console.error('Login as tenant error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Tenant paneline giriş yapılamadı';
      message.error(errorMessage);
    },
  });
};