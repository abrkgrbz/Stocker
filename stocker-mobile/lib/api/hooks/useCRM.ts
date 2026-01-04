import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { crmService } from '../services/crm.service';
import type {
    // Customer
    CustomerListParams,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    // Lead
    LeadListParams,
    CreateLeadRequest,
    UpdateLeadRequest,
    ConvertLeadRequest,
    // Opportunity
    OpportunityListParams,
    CreateOpportunityRequest,
    UpdateOpportunityRequest,
    // Activity
    ActivityListParams,
    CreateActivityRequest,
    UpdateActivityRequest,
    // CallLog
    CallLogListParams,
    CreateCallLogRequest,
    // Meeting
    MeetingListParams,
    CreateMeetingRequest,
    UpdateMeetingRequest,
    // Note
    NoteListParams,
    CreateNoteRequest,
    UpdateNoteRequest,
    // Referral
    ReferralListParams,
    CreateReferralRequest,
    UpdateReferralRequest,
    // Segment
    SegmentListParams,
    CreateSegmentRequest,
    UpdateSegmentRequest,
    // Pipeline
    PipelineListParams,
} from '../types/crm.types';

// Query Keys
export const crmKeys = {
    all: ['crm'] as const,
    // Customers
    customers: () => [...crmKeys.all, 'customers'] as const,
    customerList: (params?: CustomerListParams) => [...crmKeys.customers(), 'list', params] as const,
    customerDetail: (id: string) => [...crmKeys.customers(), 'detail', id] as const,
    customerActivities: (id: string) => [...crmKeys.customers(), 'activities', id] as const,
    customerContacts: (id: string) => [...crmKeys.customers(), 'contacts', id] as const,
    // Leads
    leads: () => [...crmKeys.all, 'leads'] as const,
    leadList: (params?: LeadListParams) => [...crmKeys.leads(), 'list', params] as const,
    leadDetail: (id: string) => [...crmKeys.leads(), 'detail', id] as const,
    leadActivities: (id: string) => [...crmKeys.leads(), 'activities', id] as const,
    leadStats: () => [...crmKeys.leads(), 'statistics'] as const,
    // Opportunities
    opportunities: () => [...crmKeys.all, 'opportunities'] as const,
    opportunityList: (params?: OpportunityListParams) => [...crmKeys.opportunities(), 'list', params] as const,
    opportunityDetail: (id: string) => [...crmKeys.opportunities(), 'detail', id] as const,
    opportunityActivities: (id: string) => [...crmKeys.opportunities(), 'activities', id] as const,
    // Deals (alias for backward compatibility)
    deals: () => crmKeys.opportunities(),
    dealList: (params?: OpportunityListParams) => crmKeys.opportunityList(params),
    dealDetail: (id: string) => crmKeys.opportunityDetail(id),
    // Activities
    activities: () => [...crmKeys.all, 'activities'] as const,
    activityList: (params?: ActivityListParams) => [...crmKeys.activities(), 'list', params] as const,
    activityDetail: (id: string) => [...crmKeys.activities(), 'detail', id] as const,
    upcomingActivities: (days?: number) => [...crmKeys.activities(), 'upcoming', days] as const,
    overdueActivities: () => [...crmKeys.activities(), 'overdue'] as const,
    calendarActivities: (start: string, end: string) => [...crmKeys.activities(), 'calendar', start, end] as const,
    activityStats: () => [...crmKeys.activities(), 'statistics'] as const,
    // CallLogs
    callLogs: () => [...crmKeys.all, 'call-logs'] as const,
    callLogList: (params?: CallLogListParams) => [...crmKeys.callLogs(), 'list', params] as const,
    callLogDetail: (id: string) => [...crmKeys.callLogs(), 'detail', id] as const,
    callLogsByCustomer: (customerId: string) => [...crmKeys.callLogs(), 'customer', customerId] as const,
    // Meetings
    meetings: () => [...crmKeys.all, 'meetings'] as const,
    meetingList: (params?: MeetingListParams) => [...crmKeys.meetings(), 'list', params] as const,
    meetingDetail: (id: string) => [...crmKeys.meetings(), 'detail', id] as const,
    // Notes
    notes: () => [...crmKeys.all, 'notes'] as const,
    noteList: (params?: NoteListParams) => [...crmKeys.notes(), 'list', params] as const,
    // Referrals
    referrals: () => [...crmKeys.all, 'referrals'] as const,
    referralList: (params?: ReferralListParams) => [...crmKeys.referrals(), 'list', params] as const,
    referralDetail: (id: string) => [...crmKeys.referrals(), 'detail', id] as const,
    // Pipelines
    pipelines: () => [...crmKeys.all, 'pipelines'] as const,
    pipelineList: (params?: PipelineListParams) => [...crmKeys.pipelines(), 'list', params] as const,
    pipelineDetail: (id: string) => [...crmKeys.pipelines(), 'detail', id] as const,
    defaultPipeline: () => [...crmKeys.pipelines(), 'default'] as const,
    // Pipeline Stats
    pipelineStats: () => [...crmKeys.all, 'pipeline', 'stats'] as const,
    // Segments
    segments: () => [...crmKeys.all, 'segments'] as const,
    segmentList: (params?: SegmentListParams) => [...crmKeys.segments(), 'list', params] as const,
    segmentDetail: (id: string) => [...crmKeys.segments(), 'detail', id] as const,
    // Dashboard
    dashboardStats: () => [...crmKeys.all, 'dashboard', 'stats'] as const,
};

// ============================================
// Customers Hooks
// ============================================

export function useCustomers(params?: CustomerListParams) {
    return useQuery({
        queryKey: crmKeys.customerList(params),
        queryFn: () => crmService.getCustomers(params),
    });
}

export function useInfiniteCustomers(params?: Omit<CustomerListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...crmKeys.customers(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => crmService.getCustomers({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
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

export function useCustomerContacts(customerId: string) {
    return useQuery({
        queryKey: crmKeys.customerContacts(customerId),
        queryFn: () => crmService.getCustomerContacts(customerId),
        enabled: !!customerId,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerRequest) => crmService.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
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
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useSearchCustomers(query: string) {
    return useQuery({
        queryKey: [...crmKeys.customers(), 'search', query],
        queryFn: () => crmService.searchCustomers(query),
        enabled: query.length >= 2,
    });
}

// ============================================
// Leads Hooks
// ============================================

export function useLeads(params?: LeadListParams) {
    return useQuery({
        queryKey: crmKeys.leadList(params),
        queryFn: () => crmService.getLeads(params),
    });
}

export function useInfiniteLeads(params?: Omit<LeadListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...crmKeys.leads(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => crmService.getLeads({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useLead(id: string) {
    return useQuery({
        queryKey: crmKeys.leadDetail(id),
        queryFn: () => crmService.getLead(id),
        enabled: !!id,
    });
}

export function useLeadActivities(leadId: string) {
    return useQuery({
        queryKey: crmKeys.leadActivities(leadId),
        queryFn: () => crmService.getLeadActivities(leadId),
        enabled: !!leadId,
    });
}

export function useLeadStatistics(fromDate?: string, toDate?: string) {
    return useQuery({
        queryKey: crmKeys.leadStats(),
        queryFn: () => crmService.getLeadStatistics(fromDate, toDate),
    });
}

export function useCreateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLeadRequest) => crmService.createLead(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
            queryClient.invalidateQueries({ queryKey: crmKeys.leadStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useUpdateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
            crmService.updateLead(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leadDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
        },
    });
}

export function useDeleteLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteLead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
            queryClient.invalidateQueries({ queryKey: crmKeys.leadStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ConvertLeadRequest }) =>
            crmService.convertLead(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
            queryClient.invalidateQueries({ queryKey: crmKeys.customers() });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useQualifyLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.qualifyLead(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leadDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
            queryClient.invalidateQueries({ queryKey: crmKeys.leadStats() });
        },
    });
}

export function useDisqualifyLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            crmService.disqualifyLead(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.leadDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
            queryClient.invalidateQueries({ queryKey: crmKeys.leadStats() });
        },
    });
}

// ============================================
// Opportunities Hooks (with Deal aliases)
// ============================================

export function useOpportunities(params?: OpportunityListParams) {
    return useQuery({
        queryKey: crmKeys.opportunityList(params),
        queryFn: () => crmService.getOpportunities(params),
    });
}

export function useInfiniteOpportunities(params?: Omit<OpportunityListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...crmKeys.opportunities(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => crmService.getOpportunities({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useOpportunity(id: string) {
    return useQuery({
        queryKey: crmKeys.opportunityDetail(id),
        queryFn: () => crmService.getOpportunity(id),
        enabled: !!id,
    });
}

export function useOpportunityActivities(opportunityId: string) {
    return useQuery({
        queryKey: crmKeys.opportunityActivities(opportunityId),
        queryFn: () => crmService.getOpportunityActivities(opportunityId),
        enabled: !!opportunityId,
    });
}

export function useCreateOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOpportunityRequest) => crmService.createOpportunity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useUpdateOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityRequest }) =>
            crmService.updateOpportunity(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
        },
    });
}

export function useDeleteOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteOpportunity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useMoveOpportunityStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
            crmService.moveOpportunityStage(id, stageId),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
        },
    });
}

export function useWinOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, actualCloseDate, notes }: { id: string; actualCloseDate?: string; notes?: string }) =>
            crmService.winOpportunity(id, actualCloseDate, notes),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useLoseOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, lostReason, notes }: { id: string; lostReason?: string; notes?: string }) =>
            crmService.loseOpportunity(id, lostReason, notes),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

// Backward compatibility aliases for Deals
export const useDeals = useOpportunities;
export const useInfiniteDeals = useInfiniteOpportunities;
export const useDeal = useOpportunity;
export const useCreateDeal = useCreateOpportunity;
export const useUpdateDeal = useUpdateOpportunity;
export const useDeleteDeal = useDeleteOpportunity;

// Legacy stage update (now uses move-stage)
export function useUpdateDealStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: string }) =>
            crmService.moveOpportunityStage(id, stage),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.opportunities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStats() });
        },
    });
}

// ============================================
// Activities Hooks
// ============================================

export function useActivities(params?: ActivityListParams) {
    return useQuery({
        queryKey: crmKeys.activityList(params),
        queryFn: () => crmService.getActivities(params),
    });
}

export function useActivity(id: string) {
    return useQuery({
        queryKey: crmKeys.activityDetail(id),
        queryFn: () => crmService.getActivity(id),
        enabled: !!id,
    });
}

export function useUpcomingActivities(days: number = 7, assignedToId?: string) {
    return useQuery({
        queryKey: crmKeys.upcomingActivities(days),
        queryFn: () => crmService.getUpcomingActivities(days, assignedToId),
    });
}

export function useOverdueActivities(assignedToId?: string) {
    return useQuery({
        queryKey: crmKeys.overdueActivities(),
        queryFn: () => crmService.getOverdueActivities(assignedToId),
    });
}

export function useCalendarActivities(startDate: string, endDate: string, assignedToId?: string) {
    return useQuery({
        queryKey: crmKeys.calendarActivities(startDate, endDate),
        queryFn: () => crmService.getCalendarActivities(startDate, endDate, assignedToId),
        enabled: !!startDate && !!endDate,
    });
}

export function useActivityStatistics(fromDate?: string, toDate?: string) {
    return useQuery({
        queryKey: crmKeys.activityStats(),
        queryFn: () => crmService.getActivityStatistics(fromDate, toDate),
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateActivityRequest) => crmService.createActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.activityStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useUpdateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
            crmService.updateActivity(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
        },
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.activityStats() });
            queryClient.invalidateQueries({ queryKey: crmKeys.dashboardStats() });
        },
    });
}

export function useCompleteActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, outcome }: { id: string; outcome?: string }) =>
            crmService.completeActivity(id, outcome),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
            queryClient.invalidateQueries({ queryKey: crmKeys.activityStats() });
        },
    });
}

export function useCancelActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            crmService.cancelActivity(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
        },
    });
}

export function useRescheduleActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, newDueDate }: { id: string; newDueDate: string }) =>
            crmService.rescheduleActivity(id, newDueDate),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.activityDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.activities() });
        },
    });
}

// ============================================
// CallLogs Hooks
// ============================================

export function useCallLogs(params?: CallLogListParams) {
    return useQuery({
        queryKey: crmKeys.callLogList(params),
        queryFn: () => crmService.getCallLogs(params),
    });
}

export function useCallLog(id: string) {
    return useQuery({
        queryKey: crmKeys.callLogDetail(id),
        queryFn: () => crmService.getCallLog(id),
        enabled: !!id,
    });
}

export function useCallLogsByCustomer(customerId: string) {
    return useQuery({
        queryKey: crmKeys.callLogsByCustomer(customerId),
        queryFn: () => crmService.getCallLogsByCustomer(customerId),
        enabled: !!customerId,
    });
}

export function useCreateCallLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCallLogRequest) => crmService.createCallLog(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogs() });
        },
    });
}

export function useCompleteCallLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, outcome, outcomeDescription }: { id: string; outcome: string; outcomeDescription?: string }) =>
            crmService.completeCallLog(id, outcome, outcomeDescription),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogs() });
        },
    });
}

export function useSetCallLogFollowUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, followUpDate, followUpNote }: { id: string; followUpDate: string; followUpNote?: string }) =>
            crmService.setCallLogFollowUp(id, followUpDate, followUpNote),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogs() });
        },
    });
}

export function useDeleteCallLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteCallLog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.callLogs() });
        },
    });
}

// ============================================
// Meetings Hooks
// ============================================

export function useMeetings(params?: MeetingListParams) {
    return useQuery({
        queryKey: crmKeys.meetingList(params),
        queryFn: () => crmService.getMeetings(params),
    });
}

export function useMeeting(id: string) {
    return useQuery({
        queryKey: crmKeys.meetingDetail(id),
        queryFn: () => crmService.getMeeting(id),
        enabled: !!id,
    });
}

export function useCreateMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMeetingRequest) => crmService.createMeeting(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.meetings() });
        },
    });
}

export function useUpdateMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMeetingRequest }) =>
            crmService.updateMeeting(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.meetingDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.meetings() });
        },
    });
}

export function useDeleteMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteMeeting(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.meetings() });
        },
    });
}

// ============================================
// Notes Hooks
// ============================================

export function useNotes(params?: NoteListParams) {
    return useQuery({
        queryKey: crmKeys.noteList(params),
        queryFn: () => crmService.getNotes(params),
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateNoteRequest) => crmService.createNote(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.notes() });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
            crmService.updateNote(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.notes() });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.notes() });
        },
    });
}

// ============================================
// Referrals Hooks
// ============================================

export function useReferrals(params?: ReferralListParams) {
    return useQuery({
        queryKey: crmKeys.referralList(params),
        queryFn: () => crmService.getReferrals(params),
    });
}

export function useReferral(id: string) {
    return useQuery({
        queryKey: crmKeys.referralDetail(id),
        queryFn: () => crmService.getReferral(id),
        enabled: !!id,
    });
}

export function useCreateReferral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReferralRequest) => crmService.createReferral(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.referrals() });
        },
    });
}

export function useUpdateReferral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReferralRequest }) =>
            crmService.updateReferral(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.referralDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.referrals() });
        },
    });
}

export function useDeleteReferral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteReferral(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.referrals() });
        },
    });
}

// ============================================
// Pipelines Hooks
// ============================================

export function usePipelines(params?: PipelineListParams) {
    return useQuery({
        queryKey: crmKeys.pipelineList(params),
        queryFn: () => crmService.getPipelines(params),
    });
}

export function usePipeline(id: string) {
    return useQuery({
        queryKey: crmKeys.pipelineDetail(id),
        queryFn: () => crmService.getPipeline(id),
        enabled: !!id,
    });
}

export function useDefaultPipeline() {
    return useQuery({
        queryKey: crmKeys.defaultPipeline(),
        queryFn: () => crmService.getDefaultPipeline(),
    });
}

// ============================================
// Segments Hooks
// ============================================

export function useSegments(params?: SegmentListParams) {
    return useQuery({
        queryKey: crmKeys.segmentList(params),
        queryFn: () => crmService.getSegments(params),
    });
}

export function useSegment(id: string) {
    return useQuery({
        queryKey: crmKeys.segmentDetail(id),
        queryFn: () => crmService.getSegment(id),
        enabled: !!id,
    });
}

export function useCreateSegment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSegmentRequest) => crmService.createSegment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
        },
    });
}

export function useUpdateSegment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSegmentRequest }) =>
            crmService.updateSegment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: crmKeys.segmentDetail(id) });
            queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
        },
    });
}

export function useDeleteSegment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmService.deleteSegment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: crmKeys.segments() });
        },
    });
}

// ============================================
// Dashboard & Pipeline Stats Hooks
// ============================================

export function usePipelineStats() {
    return useQuery({
        queryKey: crmKeys.pipelineStats(),
        queryFn: () => crmService.getPipelineStats(),
    });
}

export function useCRMDashboardStats() {
    return useQuery({
        queryKey: crmKeys.dashboardStats(),
        queryFn: () => crmService.getDashboardStats(),
    });
}
