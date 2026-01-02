import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../services/crm.service';
import type {
    CustomerListParams,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    DealListParams,
} from '../types/crm.types';

// Query Keys
export const crmKeys = {
    all: ['crm'] as const,
    customers: () => [...crmKeys.all, 'customers'] as const,
    customerList: (params?: CustomerListParams) => [...crmKeys.customers(), 'list', params] as const,
    customerDetail: (id: string) => [...crmKeys.customers(), 'detail', id] as const,
    customerActivities: (id: string) => [...crmKeys.customers(), 'activities', id] as const,
    deals: () => [...crmKeys.all, 'deals'] as const,
    dealList: (params?: DealListParams) => [...crmKeys.deals(), 'list', params] as const,
    dealDetail: (id: string) => [...crmKeys.deals(), 'detail', id] as const,
    pipelineStats: () => [...crmKeys.all, 'pipeline', 'stats'] as const,
};

// Customers Hooks
export function useCustomers(params?: CustomerListParams) {
    return useQuery({
        queryKey: crmKeys.customerList(params),
        queryFn: () => crmService.getCustomers(params),
    });
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: crmKeys.customerDetail(id),
        queryFn: () => crmService.getCustomer(id),
        enabled: !!id,
    });
}

export function useCustomerActivities(customerId: string) {
    return useQuery({
        queryKey: crmKeys.customerActivities(customerId),
        queryFn: () => crmService.getCustomerActivities(customerId),
        enabled: !!customerId,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerRequest) => crmService.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
            crmService.updateCustomer(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.customerDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
        },
    });
}

// Deals Hooks
export function useDeals(params?: DealListParams) {
    return useQuery({
        queryKey: crmKeys.dealList(params),
        queryFn: () => crmService.getDeals(params),
    });
}

export function useDeal(id: string) {
    return useQuery({
        queryKey: crmKeys.dealDetail(id),
        queryFn: () => crmService.getDeal(id),
        enabled: !!id,
    });
}

export function useUpdateDealStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: string }) =>
            crmService.updateDealStage(id, stage),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.dealDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.deals() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
        },
    });
}

// Pipeline Stats
export function usePipelineStats() {
    return useQuery({
        queryKey: crmKeys.pipelineStats(),
        queryFn: () => crmService.getPipelineStats(),
    });
}

// Search
export function useSearchCustomers(query: string) {
    return useQuery({
        queryKey: [...crmKeys.customers(), 'search', query],
        queryFn: () => crmService.searchCustomers(query),
        enabled: query.length >= 2,
    });
}
