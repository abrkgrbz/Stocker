import { useQuery } from '@tanstack/react-query';
import { tenantService, type TenantDto } from '../services/tenantService';

export const useTenantDetail = (id?: string) => {
    return useQuery<TenantDto>({
        queryKey: ['tenant', id],
        queryFn: () => tenantService.getById(id!),
        enabled: !!id,
    });
};
