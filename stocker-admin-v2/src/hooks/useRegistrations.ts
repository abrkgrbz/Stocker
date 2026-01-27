import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantRegistrationService, type TenantRegistrationDto } from '../services/tenantRegistrationService';
import { useToast } from './useToast';

export const useRegistrations = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const registrationsQuery = useQuery<TenantRegistrationDto[]>({
        queryKey: ['registrations'],
        queryFn: () => tenantRegistrationService.getPendingRegistrations(),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => tenantRegistrationService.approveRegistration(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.show('Organizasyon başarıyla onaylandı ve tenant oluşturuldu.', 'success');
        },
        onError: (error: any) => {
            toast.show(error.message || 'Onay işlemi sırasında bir hata oluştu.', 'error');
        }
    });

    return {
        registrations: registrationsQuery.data,
        isLoading: registrationsQuery.isLoading,
        approveRegistration: approveMutation.mutate,
        isActionLoading: approveMutation.isPending
    };
};
