import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { masterPackageApi } from '@/shared/api/master.api';
import { Package } from '@/shared/types';

// Query Keys
export const packageKeys = {
  all: ['master', 'packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  details: () => [...packageKeys.all, 'detail'] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
  subscribers: (id: string) => [...packageKeys.all, 'subscribers', id] as const,
};

// Get all packages
export const useGetPackages = () => {
  return useQuery({
    queryKey: packageKeys.lists(),
    queryFn: () => masterPackageApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get package by ID
export const useGetPackage = (id: string) => {
  return useQuery({
    queryKey: packageKeys.detail(id),
    queryFn: () => masterPackageApi.getById(id),
    enabled: !!id,
  });
};

// Get package subscribers
export const useGetPackageSubscribers = (id: string) => {
  return useQuery({
    queryKey: packageKeys.subscribers(id),
    queryFn: () => masterPackageApi.getSubscribers(id),
    enabled: !!id,
  });
};

// Create package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Package>) => masterPackageApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      message.success('Paket başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Paket oluşturulamadı');
    },
  });
};

// Update package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Package> }) =>
      masterPackageApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
      message.success('Paket başarıyla güncellendi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Paket güncellenemedi');
    },
  });
};

// Delete package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => masterPackageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      message.success('Paket başarıyla silindi');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Paket silinemedi');
    },
  });
};

// Duplicate package
export const useDuplicatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => masterPackageApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      message.success('Paket başarıyla kopyalandı');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Paket kopyalanamadı');
    },
  });
};

// Toggle package status
export const useTogglePackageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      masterPackageApi.toggleStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
      message.success(`Paket ${variables.isActive ? 'aktifleştirildi' : 'pasifleştirildi'}`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Paket durumu değiştirilemedi');
    },
  });
};