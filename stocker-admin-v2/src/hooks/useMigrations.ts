import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { migrationService } from '../services/migrationService';

export const useMigrations = () => {
    const queryClient = useQueryClient();

    const tenantsQuery = useQuery({
        queryKey: ['migrations', 'tenants'],
        queryFn: () => migrationService.getPendingMigrations(),
    });

    const masterQuery = useQuery({
        queryKey: ['migrations', 'master'],
        queryFn: () => migrationService.getMasterPendingMigrations(),
    });

    const applyMutation = useMutation({
        mutationFn: (tenantId: string) => migrationService.applyMigration(tenantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    const applyAllMutation = useMutation({
        mutationFn: () => migrationService.applyAllMigrations(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    const applyMasterMutation = useMutation({
        mutationFn: () => migrationService.applyMasterMigration(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    return {
        tenants: tenantsQuery.data,
        isLoadingTenants: tenantsQuery.isLoading,
        master: masterQuery.data,
        isLoadingMaster: masterQuery.isLoading,
        applyMigration: applyMutation.mutateAsync,
        isApplying: applyMutation.isPending,
        applyAllMigrations: applyAllMutation.mutateAsync,
        isApplyingAll: applyAllMutation.isPending,
        applyMasterMigration: applyMasterMutation.mutateAsync,
        isApplyingMaster: applyMasterMutation.isPending,
        refetch: () => {
            tenantsQuery.refetch();
            masterQuery.refetch();
        }
    };
};
