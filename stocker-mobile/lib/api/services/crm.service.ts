import api from '@/lib/axios';
import type {
    // Customer
    Customer,
    CustomerListParams,
    CustomerListResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    // Lead
    Lead,
    LeadListParams,
    LeadListResponse,
    CreateLeadRequest,
    UpdateLeadRequest,
    ConvertLeadRequest,
    LeadStats,
    // Opportunity
    Opportunity,
    OpportunityListParams,
    OpportunityListResponse,
    CreateOpportunityRequest,
    UpdateOpportunityRequest,
    PipelineStats,
    // Activity
    Activity,
    ActivityListParams,
    ActivityListResponse,
    CreateActivityRequest,
    UpdateActivityRequest,
    ActivityStats,
    // CallLog
    CallLog,
    CallLogListParams,
    CallLogListResponse,
    CreateCallLogRequest,
    UpdateCallLogRequest,
    // Meeting
    Meeting,
    MeetingListParams,
    MeetingListResponse,
    CreateMeetingRequest,
    UpdateMeetingRequest,
    // Note
    Note,
    NoteListParams,
    NoteListResponse,
    CreateNoteRequest,
    UpdateNoteRequest,
    // Referral
    Referral,
    ReferralListParams,
    ReferralListResponse,
    CreateReferralRequest,
    UpdateReferralRequest,
    // Pipeline
    Pipeline,
    PipelineListParams,
    PipelineListResponse,
    // Dashboard
    CRMDashboardStats,
    // Segment
    Segment,
    SegmentListParams,
    SegmentListResponse,
    CreateSegmentRequest,
    UpdateSegmentRequest,
    // Contact
    Contact,
} from '../types/crm.types';

// Backend paged response format
interface BackendPagedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

class CRMService {
    private readonly baseUrl = '/crm';

    // ============================================
    // Customers
    // ============================================

    async getCustomers(params?: CustomerListParams): Promise<CustomerListResponse> {
        const response = await api.get<BackendPagedResponse<Customer>>(`${this.baseUrl}/customers/paged`, {
            params: {
                pageNumber: params?.page || 1,
                pageSize: params?.pageSize || 20,
                searchTerm: params?.search,
                status: params?.status,
                customerType: params?.type,
                sortBy: params?.sortBy,
                sortDescending: params?.sortOrder === 'desc',
            }
        });

        return {
            items: response.data.items,
            totalCount: response.data.totalCount,
            page: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
        };
    }

    async getCustomer(id: string): Promise<Customer> {
        const response = await api.get<Customer>(`${this.baseUrl}/customers/${id}`);
        return response.data;
    }

    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        const response = await api.post<Customer>(`${this.baseUrl}/customers`, data);
        return response.data;
    }

    async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
        const response = await api.put<Customer>(`${this.baseUrl}/customers/${id}`, data);
        return response.data;
    }

    async deleteCustomer(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/customers/${id}`);
    }

    async searchCustomers(query: string): Promise<Customer[]> {
        const response = await api.get<Customer[]>(`${this.baseUrl}/customers/search`, {
            params: { q: query }
        });
        return response.data;
    }

    // ============================================
    // Contacts
    // ============================================

    async getCustomerContacts(customerId: string): Promise<Contact[]> {
        const response = await api.get<Contact[]>(`${this.baseUrl}/customers/${customerId}/contacts`);
        return response.data;
    }

    async createContact(customerId: string, data: Partial<Contact>): Promise<Contact> {
        const response = await api.post<Contact>(`${this.baseUrl}/contacts`, {
            ...data,
            customerId,
        });
        return response.data;
    }

    async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
        const response = await api.put<Contact>(`${this.baseUrl}/contacts/${id}`, data);
        return response.data;
    }

    async deleteContact(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/contacts/${id}`);
    }

    // ============================================
    // Leads
    // ============================================

    async getLeads(params?: LeadListParams): Promise<LeadListResponse> {
        const response = await api.get<Lead[]>(`${this.baseUrl}/leads`, {
            params: {
                search: params?.search,
                status: params?.status,
                rating: params?.rating,
                source: params?.source,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            totalPages: Math.ceil(items.length / (params?.pageSize || 20)),
        };
    }

    async getLead(id: string): Promise<Lead> {
        const response = await api.get<Lead>(`${this.baseUrl}/leads/${id}`);
        return response.data;
    }

    async createLead(data: CreateLeadRequest): Promise<Lead> {
        const response = await api.post<Lead>(`${this.baseUrl}/leads`, data);
        return response.data;
    }

    async updateLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
        const response = await api.put<Lead>(`${this.baseUrl}/leads/${id}`, {
            id,
            ...data,
        });
        return response.data;
    }

    async deleteLead(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/leads/${id}`);
    }

    async convertLead(id: string, data: ConvertLeadRequest): Promise<{ customerId?: string; opportunityId?: string }> {
        const response = await api.post<{ customerId?: string; opportunityId?: string }>(
            `${this.baseUrl}/leads/${id}/convert`,
            { leadId: id, ...data }
        );
        return response.data;
    }

    async qualifyLead(id: string): Promise<Lead> {
        const response = await api.post<Lead>(`${this.baseUrl}/leads/${id}/qualify`, { id });
        return response.data;
    }

    async disqualifyLead(id: string, reason?: string): Promise<Lead> {
        const response = await api.post<Lead>(`${this.baseUrl}/leads/${id}/disqualify`, { id, reason });
        return response.data;
    }

    async assignLead(id: string, assignedToId: string): Promise<Lead> {
        const response = await api.post<Lead>(`${this.baseUrl}/leads/${id}/assign`, { id, assignedToId });
        return response.data;
    }

    async getLeadActivities(leadId: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/leads/${leadId}/activities`);
        return response.data;
    }

    async getLeadStatistics(fromDate?: string, toDate?: string): Promise<LeadStats> {
        const response = await api.get<LeadStats>(`${this.baseUrl}/leads/statistics`, {
            params: { fromDate, toDate }
        });
        return response.data;
    }

    // ============================================
    // Opportunities (formerly Deals)
    // ============================================

    async getOpportunities(params?: OpportunityListParams): Promise<OpportunityListResponse> {
        const response = await api.get<Opportunity[]>(`${this.baseUrl}/opportunities`, {
            params: {
                search: params?.search,
                status: params?.status,
                customerId: params?.customerId,
                pipelineId: params?.pipelineId,
                stageId: params?.stageId,
                minAmount: params?.minAmount,
                maxAmount: params?.maxAmount,
                fromDate: params?.expectedCloseDateFrom,
                toDate: params?.expectedCloseDateTo,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            totalPages: Math.ceil(items.length / (params?.pageSize || 20)),
        };
    }

    async getOpportunity(id: string): Promise<Opportunity> {
        const response = await api.get<Opportunity>(`${this.baseUrl}/opportunities/${id}`);
        return response.data;
    }

    async createOpportunity(data: CreateOpportunityRequest): Promise<Opportunity> {
        const response = await api.post<Opportunity>(`${this.baseUrl}/opportunities`, data);
        return response.data;
    }

    async updateOpportunity(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
        const response = await api.put<Opportunity>(`${this.baseUrl}/opportunities/${id}`, {
            id,
            ...data,
        });
        return response.data;
    }

    async deleteOpportunity(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/opportunities/${id}`);
    }

    async moveOpportunityStage(id: string, stageId: string): Promise<Opportunity> {
        const response = await api.post<Opportunity>(`${this.baseUrl}/opportunities/${id}/move-stage`, {
            opportunityId: id,
            stageId,
        });
        return response.data;
    }

    async winOpportunity(id: string, actualCloseDate?: string, notes?: string): Promise<Opportunity> {
        const response = await api.post<Opportunity>(`${this.baseUrl}/opportunities/${id}/win`, {
            id,
            actualCloseDate,
            notes,
        });
        return response.data;
    }

    async loseOpportunity(id: string, lostReason?: string, notes?: string): Promise<Opportunity> {
        const response = await api.post<Opportunity>(`${this.baseUrl}/opportunities/${id}/lose`, {
            id,
            lostReason,
            notes,
        });
        return response.data;
    }

    async getOpportunityActivities(opportunityId: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/opportunities/${opportunityId}/activities`);
        return response.data;
    }

    async getPipelineReport(pipelineId?: string, fromDate?: string, toDate?: string): Promise<PipelineStats> {
        const response = await api.get<PipelineStats>(`${this.baseUrl}/opportunities/pipeline-report`, {
            params: { pipelineId, fromDate, toDate }
        });
        return response.data;
    }

    // Backward compatibility aliases
    async getDeals(params?: OpportunityListParams): Promise<OpportunityListResponse> {
        return this.getOpportunities(params);
    }

    async getDeal(id: string): Promise<Opportunity> {
        return this.getOpportunity(id);
    }

    async createDeal(data: CreateOpportunityRequest): Promise<Opportunity> {
        return this.createOpportunity(data);
    }

    async updateDeal(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
        return this.updateOpportunity(id, data);
    }

    async deleteDeal(id: string): Promise<void> {
        return this.deleteOpportunity(id);
    }

    // ============================================
    // Activities
    // ============================================

    async getActivities(params?: ActivityListParams): Promise<ActivityListResponse> {
        const response = await api.get<BackendPagedResponse<Activity>>(`${this.baseUrl}/activities`, {
            params: {
                type: params?.type,
                status: params?.status,
                priority: params?.priority,
                customerId: params?.customerId,
                contactId: params?.contactId,
                leadId: params?.leadId,
                opportunityId: params?.opportunityId,
                assignedToId: params?.assignedToId,
                fromDate: params?.dueDateFrom,
                toDate: params?.dueDateTo,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        return {
            items: response.data.items || [],
            totalCount: response.data.totalCount || 0,
            page: response.data.pageNumber || params?.page || 1,
            pageSize: response.data.pageSize || params?.pageSize || 20,
            totalPages: response.data.totalPages || 1,
        };
    }

    async getActivity(id: string): Promise<Activity> {
        const response = await api.get<Activity>(`${this.baseUrl}/activities/${id}`);
        return response.data;
    }

    async createActivity(data: CreateActivityRequest): Promise<Activity> {
        const response = await api.post<Activity>(`${this.baseUrl}/activities`, data);
        return response.data;
    }

    async updateActivity(id: string, data: UpdateActivityRequest): Promise<Activity> {
        const response = await api.put<Activity>(`${this.baseUrl}/activities/${id}`, {
            id,
            ...data,
        });
        return response.data;
    }

    async deleteActivity(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/activities/${id}`);
    }

    async completeActivity(id: string, outcome?: string): Promise<Activity> {
        const response = await api.post<Activity>(`${this.baseUrl}/activities/${id}/complete`, {
            id,
            outcome,
        });
        return response.data;
    }

    async cancelActivity(id: string, reason?: string): Promise<Activity> {
        const response = await api.post<Activity>(`${this.baseUrl}/activities/${id}/cancel`, {
            id,
            reason,
        });
        return response.data;
    }

    async rescheduleActivity(id: string, newDueDate: string): Promise<Activity> {
        const response = await api.post<Activity>(`${this.baseUrl}/activities/${id}/reschedule`, {
            id,
            newDueDate,
        });
        return response.data;
    }

    async getUpcomingActivities(days: number = 7, assignedToId?: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/activities/upcoming`, {
            params: { days, assignedToId }
        });
        return response.data;
    }

    async getOverdueActivities(assignedToId?: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/activities/overdue`, {
            params: { assignedToId }
        });
        return response.data;
    }

    async getCalendarActivities(startDate: string, endDate: string, assignedToId?: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/activities/calendar`, {
            params: { startDate, endDate, assignedToId }
        });
        return response.data;
    }

    async getActivityStatistics(fromDate?: string, toDate?: string): Promise<ActivityStats> {
        const response = await api.get<ActivityStats>(`${this.baseUrl}/activities/statistics`, {
            params: { fromDate, toDate }
        });
        return response.data;
    }

    async getCustomerActivities(customerId: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/customers/${customerId}/activities`);
        return response.data;
    }

    // ============================================
    // Call Logs
    // ============================================

    async getCallLogs(params?: CallLogListParams): Promise<CallLogListResponse> {
        const response = await api.get<CallLog[]>(`${this.baseUrl}/call-logs`, {
            params: {
                customerId: params?.customerId,
                contactId: params?.contactId,
                direction: params?.direction,
                status: params?.status,
                startDate: params?.dateFrom,
                endDate: params?.dateTo,
                skip: ((params?.page || 1) - 1) * (params?.pageSize || 20),
                take: params?.pageSize || 100,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 100,
            totalPages: 1,
        };
    }

    async getCallLog(id: string): Promise<CallLog> {
        const response = await api.get<CallLog>(`${this.baseUrl}/call-logs/${id}`);
        return response.data;
    }

    async getCallLogsByCustomer(customerId: string): Promise<CallLog[]> {
        const response = await api.get<CallLog[]>(`${this.baseUrl}/call-logs/customer/${customerId}`);
        return response.data;
    }

    async createCallLog(data: CreateCallLogRequest): Promise<CallLog> {
        // Map mobile request to backend format
        const backendData = {
            callNumber: data.subject,
            direction: data.direction,
            callerNumber: data.direction === 'Outbound' ? '' : data.phoneNumber,
            calledNumber: data.direction === 'Outbound' ? data.phoneNumber : '',
            startTime: data.startedAt,
            callType: data.callType,
            customerId: data.customerId,
            contactId: data.contactId,
            leadId: data.leadId,
            opportunityId: data.opportunityId,
            notes: data.notes,
        };
        const response = await api.post<string>(`${this.baseUrl}/call-logs`, backendData);
        // Backend returns just the ID, fetch full record
        return this.getCallLog(response.data);
    }

    async completeCallLog(id: string, outcome: string, outcomeDescription?: string): Promise<void> {
        await api.put(`${this.baseUrl}/call-logs/${id}/complete`, {
            outcome,
            outcomeDescription,
        });
    }

    async setCallLogFollowUp(id: string, followUpDate: string, followUpNote?: string): Promise<void> {
        await api.put(`${this.baseUrl}/call-logs/${id}/follow-up`, {
            followUpDate,
            followUpNote,
        });
    }

    async deleteCallLog(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/call-logs/${id}`);
    }

    // ============================================
    // Meetings
    // ============================================

    async getMeetings(params?: MeetingListParams): Promise<MeetingListResponse> {
        const response = await api.get<Meeting[]>(`${this.baseUrl}/meetings`, {
            params: {
                fromDate: params?.startDateFrom,
                toDate: params?.startDateTo,
                status: params?.status,
                type: params?.meetingType,
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
            totalPages: 1,
        };
    }

    async getMeeting(id: string): Promise<Meeting> {
        const response = await api.get<Meeting>(`${this.baseUrl}/meetings/${id}`);
        return response.data;
    }

    async createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
        // Map mobile request to backend format
        const backendData = {
            title: data.subject,
            startTime: data.startTime,
            endTime: data.endTime,
            meetingType: data.meetingType,
            description: data.description,
            priority: data.priority,
            locationType: data.locationType,
            location: data.location,
            onlineMeetingLink: data.virtualMeetingUrl,
            onlineMeetingPlatform: undefined,
            customerId: data.customerId,
            contactId: data.contactId,
            leadId: data.leadId,
            opportunityId: data.opportunityId,
            agenda: data.notes,
            organizerId: data.organizerId,
        };
        const response = await api.post<string>(`${this.baseUrl}/meetings`, backendData);
        // Backend returns just the ID, fetch full record
        return this.getMeeting(response.data);
    }

    async updateMeeting(id: string, data: UpdateMeetingRequest): Promise<Meeting> {
        const backendData = {
            id,
            title: data.subject,
            startTime: data.startTime,
            endTime: data.endTime,
            meetingType: data.meetingType,
            description: data.description,
            priority: data.priority,
            locationType: data.locationType,
            location: data.location,
            onlineMeetingLink: data.virtualMeetingUrl,
            notes: data.notes,
        };
        await api.put(`${this.baseUrl}/meetings/${id}`, backendData);
        return this.getMeeting(id);
    }

    async deleteMeeting(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/meetings/${id}`);
    }

    // ============================================
    // Notes
    // ============================================

    async getNotes(params?: NoteListParams): Promise<NoteListResponse> {
        const response = await api.get<Note[]>(`${this.baseUrl}/notes`, {
            params: {
                search: params?.search,
                customerId: params?.customerId,
                contactId: params?.contactId,
                leadId: params?.leadId,
                opportunityId: params?.opportunityId,
                isPinned: params?.isPinned,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            totalPages: 1,
        };
    }

    async createNote(data: CreateNoteRequest): Promise<Note> {
        const response = await api.post<Note>(`${this.baseUrl}/notes`, data);
        return response.data;
    }

    async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
        const response = await api.put<Note>(`${this.baseUrl}/notes/${id}`, data);
        return response.data;
    }

    async deleteNote(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/notes/${id}`);
    }

    // ============================================
    // Referrals
    // ============================================

    async getReferrals(params?: ReferralListParams): Promise<ReferralListResponse> {
        const response = await api.get<Referral[]>(`${this.baseUrl}/referrals`, {
            params: {
                search: params?.search,
                type: params?.type,
                status: params?.status,
                referrerCustomerId: params?.referrerCustomerId,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            totalPages: 1,
        };
    }

    async getReferral(id: string): Promise<Referral> {
        const response = await api.get<Referral>(`${this.baseUrl}/referrals/${id}`);
        return response.data;
    }

    async createReferral(data: CreateReferralRequest): Promise<Referral> {
        const response = await api.post<Referral>(`${this.baseUrl}/referrals`, data);
        return response.data;
    }

    async updateReferral(id: string, data: UpdateReferralRequest): Promise<Referral> {
        const response = await api.put<Referral>(`${this.baseUrl}/referrals/${id}`, data);
        return response.data;
    }

    async deleteReferral(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/referrals/${id}`);
    }

    // ============================================
    // Pipelines
    // ============================================

    async getPipelines(params?: PipelineListParams): Promise<PipelineListResponse> {
        const response = await api.get<Pipeline[]>(`${this.baseUrl}/pipelines`, {
            params: {
                search: params?.search,
                isActive: params?.isActive,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: 1,
            pageSize: items.length,
            totalPages: 1,
        };
    }

    async getPipeline(id: string): Promise<Pipeline> {
        const response = await api.get<Pipeline>(`${this.baseUrl}/pipelines/${id}`);
        return response.data;
    }

    async getDefaultPipeline(): Promise<Pipeline | null> {
        const response = await this.getPipelines({ isActive: true });
        return response.items.find(p => p.isDefault) || response.items[0] || null;
    }

    // ============================================
    // Segments
    // ============================================

    async getSegments(params?: SegmentListParams): Promise<SegmentListResponse> {
        const response = await api.get<Segment[]>(`${this.baseUrl}/customer-segments`, {
            params: {
                search: params?.search,
                isActive: params?.isActive,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
            }
        });

        const items = response.data || [];
        return {
            items,
            totalCount: items.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            totalPages: 1,
        };
    }

    async getSegment(id: string): Promise<Segment> {
        const response = await api.get<Segment>(`${this.baseUrl}/customer-segments/${id}`);
        return response.data;
    }

    async createSegment(data: CreateSegmentRequest): Promise<Segment> {
        const response = await api.post<Segment>(`${this.baseUrl}/customer-segments`, data);
        return response.data;
    }

    async updateSegment(id: string, data: UpdateSegmentRequest): Promise<Segment> {
        const response = await api.put<Segment>(`${this.baseUrl}/customer-segments/${id}`, data);
        return response.data;
    }

    async deleteSegment(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/customer-segments/${id}`);
    }

    // ============================================
    // Dashboard & Statistics
    // ============================================

    async getPipelineStats(): Promise<PipelineStats> {
        const response = await api.get<PipelineStats>(`${this.baseUrl}/opportunities/pipeline-report`);
        return response.data;
    }

    async getDashboardStats(): Promise<CRMDashboardStats> {
        // Fetch all stats in parallel
        const [pipelineStats, leadStats, activityStats, customerStats] = await Promise.all([
            this.getPipelineStats().catch(() => ({
                totalOpportunities: 0,
                totalValue: 0,
                weightedValue: 0,
                byStage: [],
                wonThisMonth: 0,
                wonValueThisMonth: 0,
                lostThisMonth: 0,
                lostValueThisMonth: 0,
                avgDealSize: 0,
                avgSalesCycle: 0,
                winRate: 0,
            })),
            this.getLeadStatistics().catch(() => ({
                totalLeads: 0,
                byStatus: [],
                bySource: [],
                byRating: [],
                convertedThisMonth: 0,
                conversionRate: 0,
            })),
            this.getActivityStatistics().catch(() => ({
                totalActivities: 0,
                completedActivities: 0,
                overdueActivities: 0,
                byType: [],
                byStatus: [],
                todayCount: 0,
                thisWeekCount: 0,
            })),
            this.getCustomers({ page: 1, pageSize: 1 }).then(res => ({
                totalCustomers: res.totalCount,
                activeCustomers: res.totalCount,
                byType: [],
                byStatus: [],
                newThisMonth: 0,
                totalRevenue: 0,
            })).catch(() => ({
                totalCustomers: 0,
                activeCustomers: 0,
                byType: [],
                byStatus: [],
                newThisMonth: 0,
                totalRevenue: 0,
            })),
        ]);

        return {
            pipeline: pipelineStats,
            leads: leadStats,
            activities: activityStats,
            customers: customerStats,
        };
    }
}

export const crmService = new CRMService();
export default crmService;
