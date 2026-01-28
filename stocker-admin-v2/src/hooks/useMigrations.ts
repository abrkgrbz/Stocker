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

    const historyQuery = useMutation({
        mutationFn: (tenantId: string) => migrationService.getMigrationHistory(tenantId),
    });

    const scheduledQuery = useQuery({
        queryKey: ['migrations', 'scheduled'],
        queryFn: () => migrationService.getScheduledMigrations(),
    });

    const settingsQuery = useQuery({
        queryKey: ['migrations', 'settings'],
        queryFn: () => migrationService.getMigrationSettings(),
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

    const rollbackMutation = useMutation({
        mutationFn: (params: { tenantId: string, moduleName: string, migrationName: string }) =>
            migrationService.rollbackMigration(params.tenantId, params.moduleName, params.migrationName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    const scheduleMutation = useMutation({
        mutationFn: (params: { tenantId: string, scheduledTime: Date, migrationName: string, moduleName: string }) =>
            migrationService.scheduleMigration(params.tenantId, params.scheduledTime, params.migrationName, params.moduleName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations', 'scheduled'] });
        }
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (scheduleId: string) => migrationService.deleteScheduledMigration(scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations', 'scheduled'] });
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (settings: any) => migrationService.updateMigrationSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations', 'settings'] });
        }
    });

    const centralStatusQuery = useQuery({
        queryKey: ['migrations', 'central'],
        queryFn: () => migrationService.getCentralStatus(),
    });

    const alertsQuery = useQuery({
        queryKey: ['migrations', 'alerts'],
        queryFn: () => migrationService.getAlertsPending(),
    });

    const applyCentralAllMutation = useMutation({
        mutationFn: () => migrationService.applyCentralAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    const applyAlertsMutation = useMutation({
        mutationFn: () => migrationService.applyAlerts(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['migrations'] });
        }
    });

    return {
        // Central Status
        centralStatus: centralStatusQuery.data,
        isLoadingCentralStatus: centralStatusQuery.isLoading,
        centralError: centralStatusQuery.error,

        // Alerts
        alerts: alertsQuery.data,
        isLoadingAlerts: alertsQuery.isLoading,
        applyAlerts: applyAlertsMutation.mutateAsync,
        isApplyingAlerts: applyAlertsMutation.isPending,

        // Central Actions
        applyCentralAll: applyCentralAllMutation.mutateAsync,
        isApplyingCentralAll: applyCentralAllMutation.isPending,

        tenants: tenantsQuery.data,
        isLoadingTenants: tenantsQuery.isLoading,
        master: masterQuery.data,
        isLoadingMaster: masterQuery.isLoading,

        // History
        getHistory: historyQuery.mutateAsync,
        isLoadingHistory: historyQuery.isPending,

        // Scheduled
        scheduled: scheduledQuery.data,
        isLoadingScheduled: scheduledQuery.isLoading,
        scheduleMigration: scheduleMutation.mutateAsync,
        isScheduling: scheduleMutation.isPending,
        deleteSchedule: deleteScheduleMutation.mutateAsync,
        isDeletingSchedule: deleteScheduleMutation.isPending,

        // Settings
        settings: settingsQuery.data,
        isLoadingSettings: settingsQuery.isLoading,
        updateSettings: updateSettingsMutation.mutateAsync,
        isUpdatingSettings: updateSettingsMutation.isPending,

        // Actions
        applyMigration: applyMutation.mutateAsync,
        isApplying: applyMutation.isPending,
        applyAllMigrations: applyAllMutation.mutateAsync,
        isApplyingAll: applyAllMutation.isPending,
        applyMasterMigration: applyMasterMutation.mutateAsync,
        isApplyingMaster: applyMasterMutation.isPending,
        rollbackMigration: rollbackMutation.mutateAsync,
        isRollingBack: rollbackMutation.isPending,

        refetch: () => {
            centralStatusQuery.refetch();
            alertsQuery.refetch();
            tenantsQuery.refetch();
            masterQuery.refetch();
            scheduledQuery.refetch();
            settingsQuery.refetch();
        }
    };
};
