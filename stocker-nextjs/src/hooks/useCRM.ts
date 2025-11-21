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
  customer: (id: string) => [...crmKeys.customers(), id] as const,
  leads: () => [...crmKeys.all, 'leads'] as const,
  leadsList: (filters?: CustomerFilters) =>
    [...crmKeys.leads(), 'list', filters] as const,
  lead: (id: string) => [...crmKeys.leads(), id] as const,
  deals: () => [...crmKeys.all, 'deals'] as const,
  dealsList: (filters?: CustomerFilters) =>
    [...crmKeys.deals(), 'list', filters] as const,
  deal: (id: string) => [...crmKeys.deals(), id] as const,
  activities: () => [...crmKeys.all, 'activities'] as const,
  activitiesList: (filters?: CustomerFilters) =>
    [...crmKeys.activities(), 'list', filters] as const,
  activity: (id: number) => [...crmKeys.activities(), id] as const,
  pipelines: () => [...crmKeys.all, 'pipelines'] as const,
  pipeline: (id: string) => [...crmKeys.pipelines(), id] as const,
  pipelineStages: (pipelineId: string) => [...crmKeys.pipelines(), pipelineId, 'stages'] as const,
  segments: () => [...crmKeys.all, 'segments'] as const,
  segment: (id: string) => [...crmKeys.segments(), id] as const,
  campaigns: () => [...crmKeys.all, 'campaigns'] as const,
  campaign: (id: string) => [...crmKeys.campaigns(), id] as const,
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
export function useCustomer(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
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
    mutationFn: (id: string) => CRMService.deleteCustomer(id),
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
export function useLead(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: any }) =>
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
export function useDeal(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: any }) =>
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
export function useActivity(id: number | string) {
  return useQuery({
    queryKey: crmKeys.activity(Number(id)),
    queryFn: () => CRMService.getActivity(Number(id)),
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
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      CRMService.updateActivity(Number(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
      queryClient.invalidateQueries({ queryKey: crmKeys.activity(Number(variables.id)) });
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

// =====================================
// PIPELINES HOOKS
// =====================================

/**
 * Hook to fetch pipelines list
 */
export function usePipelines() {
  return useQuery({
    queryKey: crmKeys.pipelines(),
    queryFn: () => CRMService.getPipelines(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch single pipeline
 */
export function usePipeline(id: string) {
  return useQuery({
    queryKey: crmKeys.pipeline(id),
    queryFn: () => CRMService.getPipeline(id),
    enabled: !!id,
  });
}

/**
 * Hook to create pipeline
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CRMService.createPipeline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      message.success('Pipeline oluşturuldu');
    },
    onError: () => {
      message.error('Pipeline oluşturulamadı');
    },
  });
}

/**
 * Hook to update pipeline
 */
export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updatePipeline(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.id) });
      message.success('Pipeline güncellendi');
    },
    onError: () => {
      message.error('Pipeline güncellenemedi');
    },
  });
}

/**
 * Hook to delete pipeline
 */
export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      message.success('Pipeline silindi');
    },
    onError: () => {
      message.error('Pipeline silinemedi');
    },
  });
}

/**
 * Hook to activate pipeline
 */
export function useActivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.activatePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      message.success('Pipeline aktifleştirildi');
    },
  });
}

/**
 * Hook to deactivate pipeline
 */
export function useDeactivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deactivatePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      message.success('Pipeline devre dışı bırakıldı');
    },
  });
}

/**
 * Hook to set pipeline as default
 */
export function useSetDefaultPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.setDefaultPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines() });
      message.success('Pipeline varsayılan olarak ayarlandı');
    },
  });
}

// =====================================
// CUSTOMER SEGMENTS HOOKS
// =====================================

/**
 * Hook to fetch customer segments list
 */
export function useCustomerSegments() {
  return useQuery({
    queryKey: crmKeys.segments(),
    queryFn: () => CRMService.getCustomerSegments(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch single customer segment
 */
export function useCustomerSegment(id: string) {
  return useQuery({
    queryKey: crmKeys.segment(id),
    queryFn: () => CRMService.getCustomerSegment(id),
    enabled: !!id,
  });
}

/**
 * Hook to create customer segment
 */
export function useCreateCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createCustomerSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
      message.success('Segment oluşturuldu');
    },
    onError: () => {
      message.error('Segment oluşturulamadı');
    },
  });
}

/**
 * Hook to update customer segment
 */
export function useUpdateCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateCustomerSegment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(variables.id) });
      message.success('Segment güncellendi');
    },
    onError: () => {
      message.error('Segment güncellenemedi');
    },
  });
}

/**
 * Hook to delete customer segment
 */
export function useDeleteCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteCustomerSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
      message.success('Segment silindi');
    },
    onError: () => {
      message.error('Segment silinemedi');
    },
  });
}

// =====================================
// CAMPAIGNS HOOKS
// =====================================

/**
 * Hook to fetch campaigns list
 */
export function useCampaigns() {
  return useQuery({
    queryKey: crmKeys.campaigns(),
    queryFn: () => CRMService.getCampaigns(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch single campaign
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: crmKeys.campaign(id),
    queryFn: () => CRMService.getCampaign(id),
    enabled: !!id,
  });
}

/**
 * Hook to create campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      message.success('Kampanya oluşturuldu');
    },
    onError: () => {
      message.error('Kampanya oluşturulamadı');
    },
  });
}

/**
 * Hook to update campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(variables.id) });
      message.success('Kampanya güncellendi');
    },
    onError: () => {
      message.error('Kampanya güncellenemedi');
    },
  });
}

/**
 * Hook to delete campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      message.success('Kampanya silindi');
    },
    onError: () => {
      message.error('Kampanya silinemedi');
    },
  });
}

/**
 * Hook to start campaign
 */
export function useStartCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.startCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      message.success('Kampanya başlatıldı');
    },
  });
}

/**
 * Hook to complete campaign
 */
export function useCompleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.completeCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      message.success('Kampanya tamamlandı');
    },
  });
}

/**
 * Hook to abort campaign
 */
export function useAbortCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.abortCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns() });
      message.success('Kampanya iptal edildi');
    },
  });
}

// =====================================
// OPPORTUNITIES HOOKS
// =====================================

/**
 * Hook to fetch opportunities list with filters
 */
export function useOpportunities(filters?: any) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => CRMService.getOpportunities(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch single opportunity
 */
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => CRMService.getOpportunity(id),
    enabled: !!id,
  });
}

/**
 * Hook to create opportunity
 */
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      message.success('Fırsat oluşturuldu');
    },
    onError: () => {
      message.error('Fırsat oluşturulamadı');
    },
  });
}

/**
 * Hook to update opportunity
 */
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateOpportunity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
      message.success('Fırsat güncellendi');
    },
    onError: () => {
      message.error('Fırsat güncellenemedi');
    },
  });
}

/**
 * Hook to delete opportunity
 */
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      message.success('Fırsat silindi');
    },
    onError: () => {
      message.error('Fırsat silinemedi');
    },
  });
}
