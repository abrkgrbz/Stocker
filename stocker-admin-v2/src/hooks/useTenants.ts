import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService, type TenantListDto, type TenantsStatisticsDto } from '../services/tenantService';
import { useToast } from './useToast';

export const useTenants = (params?: any) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const tenantsQuery = useQuery<TenantListDto[]>({
        queryKey: ['tenants', params],
        queryFn: () => tenantService.getAll(params),
    });

    const statsQuery = useQuery<TenantsStatisticsDto>({
        queryKey: ['tenants-stats'],
        queryFn: () => tenantService.getAllStatistics(),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => tenantService.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenants-stats'] });
            toast.show('Tenant durumu başarıyla güncellendi', 'success');
        },
        onError: (error: any) => {
            toast.show(error.message || 'Durum güncellenirken bir hata oluştu', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
            tenantService.delete(id, hardDelete),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenants-stats'] });
            toast.show('Tenant başarıyla silindi', 'success');
        },
        onError: (error: any) => {
            toast.show(error.message || 'Silme işlemi sırasında bir hata oluştu', 'error');
        }
    });

    return {
        tenants: tenantsQuery.data,
        isLoadingTenants: tenantsQuery.isLoading,
        stats: statsQuery.data,
        isLoadingStats: statsQuery.isLoading,
        toggleStatus: toggleStatusMutation.mutate,
        deleteTenant: deleteMutation.mutate,
        isActionLoading: toggleStatusMutation.isPending || deleteMutation.isPending
    };
};
