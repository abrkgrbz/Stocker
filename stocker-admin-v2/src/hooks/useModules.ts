import { useQuery } from '@tanstack/react-query';
import { moduleService, type ModuleDto } from '../services/moduleService';

export const useModules = () => {
    const modulesQuery = useQuery<ModuleDto[]>({
        queryKey: ['modules'],
        queryFn: () => moduleService.getAll(),
    });

    return {
        modules: modulesQuery.data || [],
        isLoading: modulesQuery.isLoading,
        error: modulesQuery.error,
        refetch: modulesQuery.refetch
    };
};
