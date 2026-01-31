import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secretsService, type SecretsListResponse, type SecretStoreStatus } from '../services/secretsService';
import { useToast } from './useToast';

export const useSecrets = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const secretsQuery = useQuery<SecretsListResponse>({
        queryKey: ['secrets'],
        queryFn: () => secretsService.getAll(),
    });

    const statusQuery = useQuery<SecretStoreStatus>({
        queryKey: ['secrets-status'],
        queryFn: () => secretsService.getStatus(),
    });

    const deleteMutation = useMutation({
        mutationFn: (name: string) => secretsService.deleteSecret(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['secrets'] });
            toast.show('Sır başarıyla silindi.', 'success');
        },
        onError: (error: any) => {
            toast.show(error.message || 'Sır silinirken bir hata oluştu.', 'error');
        }
    });

    const deleteMultipleMutation = useMutation({
        mutationFn: (names: string[]) => secretsService.deleteMultipleSecrets(names),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['secrets'] });

            const successCount = data.deletedSecrets?.length || 0;
            const failCount = data.failedSecrets?.length || 0;

            if (successCount > 0 && failCount === 0) {
                toast.show(`${successCount} hassas veri başarıyla silindi.`, 'success');
            } else if (successCount > 0 && failCount > 0) {
                toast.show(`${successCount} silindi, ${failCount} başarısız.`, 'warning');
            } else if (failCount > 0) {
                toast.show('Hiçbir veri silinemedi.', 'error');
            }
        },
        onError: (error: any) => {
            toast.show(error.message || 'Silme işlemi başarısız.', 'error');
        }
    });

    return {
        secrets: secretsQuery.data?.secrets || [],
        totalCount: secretsQuery.data?.totalCount || 0,
        provider: secretsQuery.data?.provider || '',
        isLoading: secretsQuery.isLoading,
        storeStatus: statusQuery.data,
        isLoadingStatus: statusQuery.isLoading,
        deleteSecret: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deleteMultipleSecrets: deleteMultipleMutation.mutateAsync,
        isDeletingMultiple: deleteMultipleMutation.isPending
    };
};
