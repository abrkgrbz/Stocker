import { useQuery } from '@tanstack/react-query';
import { storageService, type BucketsResponse } from '../services/storageService';

export const useStorage = () => {
    return useQuery<BucketsResponse>({
        queryKey: ['storage-buckets'],
        queryFn: () => storageService.getAllBuckets(),
    });
};
