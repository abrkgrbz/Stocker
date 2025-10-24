import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CRMService, type CustomerFilters, type CreateCustomerDto, type UpdateCustomerDto } from '@/lib/api/services/crm.service';
import { message } from 'antd';

// =====================================
// QUERY KEYS
// =====================================

export const crmKeys = {
  all: ['crm'] as const,
  customers: () => [...crmKeys.all, 'customers'] as const,
  customersList: (filters?: CustomerFilters) =>
    [...crmKeys.customers(), 'list', filters] as const,
  customer: (id: number) => [...crmKeys.customers(), id] as const,
  leads: () => [...crmKeys.all, 'leads'] as const,
  leadsList: (filters?: CustomerFilters) =>
    [...crmKeys.leads(), 'list', filters] as const,
  lead: (id: number) => [...crmKeys.leads(), id] as const,
  deals: () => [...crmKeys.all, 'deals'] as const,
  dealsList: (filters?: CustomerFilters) =>
    [...crmKeys.deals(), 'list', filters] as const,
  deal: (id: number) => [...crmKeys.deals(), id] as const,
  activities: () => [...crmKeys.all, 'activities'] as const,
  activitiesList: (filters?: CustomerFilters) =>
    [...crmKeys.activities(), 'list', filters] as const,
  activity: (id: number) => [...crmKeys.activities(), id] as const,
};

// =====================================
// CUSTOMERS HOOKS
// =====================================

/**
 * Hook to fetch customers list with filters
 */
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: crmKeys.customersList(filters),
    queryFn: () => CRMService.getCustomers(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch single customer
 */
export function useCustomer(id: number) {
  return useQuery({
    queryKey: crmKeys.customer(id),
    queryFn: () => CRMService.getCustomer(id),
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Hook to create customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => CRMService.createCustomer(data),
    onSuccess: () => {
      // Invalidate customers list to refetch
      queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
      // Don't show message here - let the component handle it
    },
    // Don't catch errors here - let them bubble up to the component
  });
}

/**
 * Hook to update customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerDto }) =>
      CRMService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
      queryClient.invalidateQueries({ queryKey: crmKeys.customer(variables.id) });
      // Don't show message here - let the component handle it
    },
    // Don't catch errors here - let them bubble up to the component
  });
}

/**
 * Hook to delete customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteCustomer(id),
    onSuccess: () => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
      message.success('Customer deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to delete customer');
    },
  });
}

// =====================================
// LEADS HOOKS
// =====================================

/**
 * Hook to fetch leads list with filters
 */
export function useLeads(filters?: CustomerFilters) {
  return useQuery({
    queryKey: crmKeys.leadsList(filters),
    queryFn: () => CRMService.getLeads(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch single lead
 */
export function useLead(id: number) {
  return useQuery({
    queryKey: crmKeys.lead(id),
    queryFn: () => CRMService.getLead(id),
    enabled: !!id,
  });
}

/**
 * Hook to create lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
}

/**
 * Hook to update lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      CRMService.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(variables.id) });
    },
  });
}

/**
 * Hook to delete lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
}

/**
 * Hook to convert lead to customer
 */
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, customerData }: { leadId: number; customerData: any }) =>
      CRMService.convertLeadToCustomer(leadId, customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
    },
  });
}

// =====================================
// DEALS HOOKS
// =====================================

/**
 * Hook to fetch deals list with filters
 */
export function useDeals(filters?: CustomerFilters) {
  return useQuery({
    queryKey: crmKeys.dealsList(filters),
    queryFn: () => CRMService.getDeals(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch single deal
 */
export function useDeal(id: number) {
  return useQuery({
    queryKey: crmKeys.deal(id),
    queryFn: () => CRMService.getDeal(id),
    enabled: !!id,
  });
}

/**
 * Hook to create deal
 */
export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals() });
    },
  });
}

/**
 * Hook to update deal
 */
export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      CRMService.updateDeal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals() });
      queryClient.invalidateQueries({ queryKey: crmKeys.deal(variables.id) });
    },
  });
}

/**
 * Hook to delete deal
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals() });
    },
  });
}

// =====================================
// ACTIVITIES HOOKS
// =====================================

/**
 * Hook to fetch activities list with filters
 */
export function useActivities(filters?: CustomerFilters) {
  return useQuery({
    queryKey: crmKeys.activitiesList(filters),
    queryFn: () => CRMService.getActivities(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch single activity
 */
export function useActivity(id: number) {
  return useQuery({
    queryKey: crmKeys.activity(id),
    queryFn: () => CRMService.getActivity(id),
    enabled: !!id,
  });
}

/**
 * Hook to create activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
    },
  });
}

/**
 * Hook to update activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      CRMService.updateActivity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
      queryClient.invalidateQueries({ queryKey: crmKeys.activity(variables.id) });
    },
  });
}

/**
 * Hook to delete activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
    },
  });
}

/**
 * Hook to complete activity
 */
export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.completeActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
    },
  });
}
