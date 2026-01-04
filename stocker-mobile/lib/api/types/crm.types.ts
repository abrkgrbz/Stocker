// CRM Module Types - Aligned with Backend API
// Last updated: Backend CRM API synchronization

// ============================================
// Enums - Must match backend exactly
// ============================================

export type CustomerType = 'Individual' | 'Corporate' | 'Government' | 'NonProfit';
export type CustomerStatus = 'Active' | 'Inactive' | 'Prospect' | 'Suspended';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted' | 'Lost';
export type LeadRating = 'Hot' | 'Warm' | 'Cold';
export type LeadSource =
    | 'Website'
    | 'Referral'
    | 'SocialMedia'
    | 'Advertisement'
    | 'ColdCall'
    | 'TradeShow'
    | 'Email'
    | 'Partner'
    | 'Other';

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note' | 'Other';
export type ActivityStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled' | 'Deferred';
export type ActivityPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type OpportunityStatus =
    | 'Qualification'
    | 'NeedsAnalysis'
    | 'Proposal'
    | 'Negotiation'
    | 'ClosedWon'
    | 'ClosedLost';

export type CallDirection = 'Inbound' | 'Outbound';
export type CallType = 'Cold' | 'FollowUp' | 'Support' | 'Sales' | 'Other';
export type CallStatus = 'Scheduled' | 'Completed' | 'NoAnswer' | 'Cancelled' | 'Rescheduled';
export type CallOutcome =
    | 'Successful'
    | 'LeftVoicemail'
    | 'WrongNumber'
    | 'NotInterested'
    | 'CallBack'
    | 'Other';

export type MeetingType = 'InPerson' | 'Video' | 'Phone' | 'Other';
export type MeetingStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'NoShow';
export type MeetingPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type MeetingLocationType = 'Office' | 'ClientSite' | 'Virtual' | 'Other';

export type ReferralStatus = 'Pending' | 'Contacted' | 'Qualified' | 'Converted' | 'Rejected' | 'Expired';
export type ReferralType = 'Customer' | 'Partner' | 'Employee' | 'Other';

// ============================================
// Customer
// ============================================

export interface Customer {
    id: string;
    companyName: string;
    email: string;
    phone?: string;
    website?: string;
    industry?: string;
    address?: string;

    // GeoLocation IDs (FK to Master DB)
    countryId?: string;
    cityId?: string;
    districtId?: string;

    // Denormalized location names
    country?: string;
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;

    // Business info
    annualRevenue?: number;
    numberOfEmployees?: number;
    description?: string;

    // Financial info
    customerType: CustomerType;
    status: CustomerStatus;
    creditLimit: number;
    taxId?: string;
    paymentTerms?: string;
    contactPerson?: string;

    isActive: boolean;
    createdAt: string;
    updatedAt?: string;

    // Related entities
    contacts?: Contact[];
}

export interface Contact {
    id: string;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    mobile?: string;
    position?: string;
    department?: string;
    isPrimary: boolean;
    isActive: boolean;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CustomerListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: CustomerStatus;
    type?: CustomerType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CustomerListResponse {
    items: Customer[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateCustomerRequest {
    companyName: string;
    email: string;
    phone?: string;
    website?: string;
    industry?: string;
    address?: string;

    // GeoLocation IDs
    countryId?: string;
    cityId?: string;
    districtId?: string;

    // Denormalized location names
    country?: string;
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;

    // Business info
    annualRevenue?: number;
    numberOfEmployees?: number;
    description?: string;

    // Financial info
    customerType?: CustomerType;
    status?: CustomerStatus;
    creditLimit?: number;
    taxId?: string;
    paymentTerms?: string;
    contactPerson?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

// ============================================
// Lead - NEW (was missing from mobile)
// ============================================

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    mobile?: string;
    company?: string;
    title?: string;

    // Address
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;

    // Lead info
    source: LeadSource;
    status: LeadStatus;
    rating: LeadRating;

    // Qualification
    industry?: string;
    annualRevenue?: number;
    numberOfEmployees?: number;
    website?: string;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Conversion
    convertedToCustomerId?: string;
    convertedToOpportunityId?: string;
    convertedAt?: string;

    // Tracking
    description?: string;
    notes?: string;
    lastContactedAt?: string;
    nextFollowUpAt?: string;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface LeadListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: LeadStatus;
    source?: LeadSource;
    rating?: LeadRating;
    assignedToId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface LeadListResponse {
    items: Lead[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateLeadRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    mobile?: string;
    company?: string;
    title?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    source: LeadSource;
    status?: LeadStatus;
    rating?: LeadRating;
    industry?: string;
    annualRevenue?: number;
    numberOfEmployees?: number;
    website?: string;
    assignedToId?: string;
    description?: string;
    notes?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {}

export interface ConvertLeadRequest {
    createCustomer: boolean;
    createOpportunity: boolean;
    customerData?: Partial<CreateCustomerRequest>;
    opportunityData?: Partial<CreateOpportunityRequest>;
}

// ============================================
// Opportunity (formerly Deal in mobile)
// ============================================

export interface Opportunity {
    id: string;
    name: string;
    customerId: string;
    customerName?: string;
    contactId?: string;
    contactName?: string;

    // Pipeline
    pipelineId?: string;
    pipelineName?: string;
    stageId?: string;
    stageName?: string;

    // Value
    amount: number;
    currency: string;
    probability: number;
    expectedRevenue?: number;

    // Status
    status: OpportunityStatus;

    // Dates
    expectedCloseDate?: string;
    actualCloseDate?: string;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Additional info
    description?: string;
    notes?: string;
    source?: string;
    lostReason?: string;
    competitorId?: string;
    competitorName?: string;

    // Tracking
    lastActivityAt?: string;
    nextFollowUpAt?: string;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

// Alias for backward compatibility
export type Deal = Opportunity;

export interface OpportunityListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    customerId?: string;
    status?: OpportunityStatus;
    pipelineId?: string;
    stageId?: string;
    assignedToId?: string;
    minAmount?: number;
    maxAmount?: number;
    expectedCloseDateFrom?: string;
    expectedCloseDateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Alias for backward compatibility
export type DealListParams = OpportunityListParams;

export interface OpportunityListResponse {
    items: Opportunity[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Alias for backward compatibility
export type DealListResponse = OpportunityListResponse;

export interface CreateOpportunityRequest {
    name: string;
    customerId: string;
    contactId?: string;
    pipelineId?: string;
    stageId?: string;
    amount: number;
    currency?: string;
    probability?: number;
    status?: OpportunityStatus;
    expectedCloseDate?: string;
    assignedToId?: string;
    description?: string;
    notes?: string;
    source?: string;
}

// Alias for backward compatibility
export type CreateDealRequest = CreateOpportunityRequest;

export interface UpdateOpportunityRequest extends Partial<CreateOpportunityRequest> {
    lostReason?: string;
    actualCloseDate?: string;
}

// Alias for backward compatibility
export type UpdateDealRequest = UpdateOpportunityRequest;

// Legacy DealStage mapping to OpportunityStatus
export type DealStage = OpportunityStatus;

// ============================================
// UI Compatibility Layer
// These mappings help bridge old UI code with new backend types
// ============================================

// UI uses camelCase stage names, backend uses PascalCase OpportunityStatus
export type UIOpportunityStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export const UI_TO_BACKEND_STAGE: Record<UIOpportunityStage, OpportunityStatus> = {
    lead: 'Qualification',
    qualified: 'NeedsAnalysis',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    won: 'ClosedWon',
    lost: 'ClosedLost',
};

export const BACKEND_TO_UI_STAGE: Record<OpportunityStatus, UIOpportunityStage> = {
    Qualification: 'lead',
    NeedsAnalysis: 'qualified',
    Proposal: 'proposal',
    Negotiation: 'negotiation',
    ClosedWon: 'won',
    ClosedLost: 'lost',
};

// UI uses camelCase activity types, backend uses PascalCase
export type UIActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'other';

export const UI_TO_BACKEND_ACTIVITY_TYPE: Record<UIActivityType, ActivityType> = {
    call: 'Call',
    email: 'Email',
    meeting: 'Meeting',
    task: 'Task',
    note: 'Note',
    other: 'Other',
};

export const BACKEND_TO_UI_ACTIVITY_TYPE: Record<ActivityType, UIActivityType> = {
    Call: 'call',
    Email: 'email',
    Meeting: 'meeting',
    Task: 'task',
    Note: 'note',
    Other: 'other',
};

// UI-friendly Opportunity interface with backward compatible fields
export interface UIOpportunity extends Omit<Opportunity, 'name' | 'amount'> {
    // Alias fields for UI compatibility
    title: string;      // maps to name
    value: number;      // maps to amount
    stage: UIOpportunityStage; // maps to status
}

// UI-friendly Activity interface
export interface UIActivity extends Omit<Activity, 'subject' | 'type'> {
    title: string;      // maps to subject
    type: UIActivityType;
}

// Helper function to convert backend Opportunity to UI format
export function toUIOpportunity(opp: Opportunity): UIOpportunity {
    return {
        ...opp,
        title: opp.name,
        value: opp.amount,
        stage: BACKEND_TO_UI_STAGE[opp.status],
    };
}

// Helper function to convert UI Opportunity to backend format
export function toBackendOpportunity(uiOpp: Partial<UIOpportunity>): Partial<CreateOpportunityRequest> {
    const result: Partial<CreateOpportunityRequest> = { ...uiOpp };

    if (uiOpp.title !== undefined) {
        result.name = uiOpp.title;
        delete (result as any).title;
    }
    if (uiOpp.value !== undefined) {
        result.amount = uiOpp.value;
        delete (result as any).value;
    }
    if (uiOpp.stage !== undefined) {
        result.status = UI_TO_BACKEND_STAGE[uiOpp.stage];
        delete (result as any).stage;
    }

    return result;
}

// Helper function to convert backend Activity to UI format
export function toUIActivity(activity: Activity): UIActivity {
    return {
        ...activity,
        title: activity.subject,
        type: BACKEND_TO_UI_ACTIVITY_TYPE[activity.type],
    };
}

// Helper function to convert UI Activity to backend format
export function toBackendActivity(uiActivity: Partial<UIActivity>): Partial<CreateActivityRequest> {
    const result: Partial<CreateActivityRequest> = { ...uiActivity };

    if (uiActivity.title !== undefined) {
        result.subject = uiActivity.title;
        delete (result as any).title;
    }
    if (uiActivity.type !== undefined) {
        result.type = UI_TO_BACKEND_ACTIVITY_TYPE[uiActivity.type];
    }

    return result;
}

// ============================================
// Activity - Updated with all backend fields
// ============================================

export interface Activity {
    id: string;
    type: ActivityType;
    subject: string;
    description?: string;

    // Status tracking
    status: ActivityStatus;
    priority: ActivityPriority;

    // Related entities
    customerId?: string;
    customerName?: string;
    contactId?: string;
    contactName?: string;
    leadId?: string;
    leadName?: string;
    opportunityId?: string;
    opportunityName?: string;

    // Scheduling
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    duration?: number; // in minutes

    // Location
    location?: string;
    isAllDay?: boolean;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Completion
    completedAt?: string;
    completedBy?: string;
    completedByName?: string;

    // Outcome
    outcome?: string;
    notes?: string;

    // Reminders
    reminderAt?: string;
    isReminderSent?: boolean;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface ActivityListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: ActivityType;
    status?: ActivityStatus;
    priority?: ActivityPriority;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    assignedToId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ActivityListResponse {
    items: Activity[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateActivityRequest {
    type: ActivityType;
    subject: string;
    description?: string;
    status?: ActivityStatus;
    priority?: ActivityPriority;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    duration?: number;
    location?: string;
    isAllDay?: boolean;
    assignedToId?: string;
    reminderAt?: string;
    notes?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
    completedAt?: string;
    outcome?: string;
}

// ============================================
// CallLog - NEW (was missing from mobile)
// ============================================

export interface CallLog {
    id: string;
    subject: string;
    description?: string;

    // Call details
    direction: CallDirection;
    callType: CallType;
    status: CallStatus;
    outcome?: CallOutcome;

    // Contact info
    phoneNumber: string;
    contactName?: string;

    // Related entities
    customerId?: string;
    customerName?: string;
    contactId?: string;
    leadId?: string;
    leadName?: string;
    opportunityId?: string;
    opportunityName?: string;

    // Timing
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
    duration?: number; // in seconds

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Recording
    recordingUrl?: string;
    hasRecording: boolean;

    // Follow-up
    followUpRequired: boolean;
    followUpDate?: string;
    followUpNotes?: string;

    // Notes
    notes?: string;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface CallLogListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    direction?: CallDirection;
    callType?: CallType;
    status?: CallStatus;
    outcome?: CallOutcome;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    assignedToId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CallLogListResponse {
    items: CallLog[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateCallLogRequest {
    subject: string;
    description?: string;
    direction: CallDirection;
    callType: CallType;
    status?: CallStatus;
    outcome?: CallOutcome;
    phoneNumber: string;
    contactName?: string;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
    duration?: number;
    assignedToId?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
    followUpNotes?: string;
    notes?: string;
}

export interface UpdateCallLogRequest extends Partial<CreateCallLogRequest> {}

// ============================================
// Meeting - NEW (was missing from mobile)
// ============================================

export interface Meeting {
    id: string;
    subject: string;
    description?: string;

    // Meeting details
    meetingType: MeetingType;
    status: MeetingStatus;
    priority: MeetingPriority;

    // Location
    locationType: MeetingLocationType;
    location?: string;
    virtualMeetingUrl?: string;
    virtualMeetingId?: string;
    virtualMeetingPassword?: string;

    // Related entities
    customerId?: string;
    customerName?: string;
    contactId?: string;
    contactName?: string;
    leadId?: string;
    leadName?: string;
    opportunityId?: string;
    opportunityName?: string;

    // Scheduling
    startTime: string;
    endTime: string;
    duration?: number; // in minutes
    isAllDay: boolean;
    timezone?: string;

    // Recurrence
    isRecurring: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: string;
    parentMeetingId?: string;

    // Organizer
    organizerId?: string;
    organizerName?: string;

    // Attendees
    attendees?: MeetingAttendee[];

    // Reminder
    reminderMinutes?: number;
    isReminderSent: boolean;

    // Outcome
    outcome?: string;
    notes?: string;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface MeetingAttendee {
    id: string;
    meetingId: string;
    attendeeType: 'User' | 'Contact' | 'External';
    userId?: string;
    contactId?: string;
    name: string;
    email: string;
    responseStatus: 'Pending' | 'Accepted' | 'Declined' | 'Tentative';
    isRequired: boolean;
    isOrganizer: boolean;
}

export interface MeetingListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    meetingType?: MeetingType;
    status?: MeetingStatus;
    priority?: MeetingPriority;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    organizerId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface MeetingListResponse {
    items: Meeting[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateMeetingRequest {
    subject: string;
    description?: string;
    meetingType: MeetingType;
    status?: MeetingStatus;
    priority?: MeetingPriority;
    locationType: MeetingLocationType;
    location?: string;
    virtualMeetingUrl?: string;
    virtualMeetingId?: string;
    virtualMeetingPassword?: string;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    startTime: string;
    endTime: string;
    isAllDay?: boolean;
    timezone?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: string;
    organizerId?: string;
    attendeeIds?: string[];
    reminderMinutes?: number;
    notes?: string;
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
    outcome?: string;
}

// ============================================
// Note
// ============================================

export interface Note {
    id: string;
    title?: string;
    content: string;

    // Related entities
    customerId?: string;
    customerName?: string;
    contactId?: string;
    contactName?: string;
    leadId?: string;
    leadName?: string;
    opportunityId?: string;
    opportunityName?: string;

    // Metadata
    isPinned: boolean;
    isPrivate: boolean;

    // Timestamps
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface NoteListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    isPinned?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface NoteListResponse {
    items: Note[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateNoteRequest {
    title?: string;
    content: string;
    customerId?: string;
    contactId?: string;
    leadId?: string;
    opportunityId?: string;
    isPinned?: boolean;
    isPrivate?: boolean;
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {}

// ============================================
// Referral
// ============================================

export interface Referral {
    id: string;
    referrerCustomerId?: string;
    referrerCustomerName?: string;
    referrerContactId?: string;
    referrerContactName?: string;

    // Referred person info
    referredName: string;
    referredEmail: string;
    referredPhone?: string;
    referredCompany?: string;

    // Referral details
    type: ReferralType;
    status: ReferralStatus;
    source?: string;
    notes?: string;

    // Conversion
    convertedToLeadId?: string;
    convertedToCustomerId?: string;
    convertedAt?: string;

    // Reward
    rewardAmount?: number;
    rewardCurrency?: string;
    rewardPaidAt?: string;

    // Tracking
    expiresAt?: string;

    // Timestamps
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface ReferralListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: ReferralType;
    status?: ReferralStatus;
    referrerCustomerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ReferralListResponse {
    items: Referral[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateReferralRequest {
    referrerCustomerId?: string;
    referrerContactId?: string;
    referredName: string;
    referredEmail: string;
    referredPhone?: string;
    referredCompany?: string;
    type: ReferralType;
    status?: ReferralStatus;
    source?: string;
    notes?: string;
    expiresAt?: string;
    rewardAmount?: number;
    rewardCurrency?: string;
}

export interface UpdateReferralRequest extends Partial<CreateReferralRequest> {}

// ============================================
// Pipeline & Stages
// ============================================

export interface Pipeline {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isActive: boolean;
    stages: PipelineStage[];
    createdAt: string;
    updatedAt?: string;
}

export interface PipelineStage {
    id: string;
    pipelineId: string;
    name: string;
    probability: number;
    order: number;
    color?: string;
    isWon: boolean;
    isLost: boolean;
    isActive: boolean;
}

export interface PipelineListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
}

export interface PipelineListResponse {
    items: Pipeline[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// Statistics & Dashboard
// ============================================

export interface PipelineStats {
    totalOpportunities: number;
    totalValue: number;
    weightedValue: number;
    byStage: {
        stageId: string;
        stageName: string;
        count: number;
        value: number;
    }[];
    wonThisMonth: number;
    wonValueThisMonth: number;
    lostThisMonth: number;
    lostValueThisMonth: number;
    avgDealSize: number;
    avgSalesCycle: number; // in days
    winRate: number;
}

export interface LeadStats {
    totalLeads: number;
    byStatus: {
        status: LeadStatus;
        count: number;
    }[];
    bySource: {
        source: LeadSource;
        count: number;
    }[];
    byRating: {
        rating: LeadRating;
        count: number;
    }[];
    convertedThisMonth: number;
    conversionRate: number;
}

export interface ActivityStats {
    totalActivities: number;
    completedActivities: number;
    overdueActivities: number;
    byType: {
        type: ActivityType;
        count: number;
        completed: number;
    }[];
    byStatus: {
        status: ActivityStatus;
        count: number;
    }[];
    todayCount: number;
    thisWeekCount: number;
}

export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    byType: {
        type: CustomerType;
        count: number;
    }[];
    byStatus: {
        status: CustomerStatus;
        count: number;
    }[];
    newThisMonth: number;
    totalRevenue: number;
}

export interface CRMDashboardStats {
    pipeline: PipelineStats;
    leads: LeadStats;
    activities: ActivityStats;
    customers: CustomerStats;
}

// ============================================
// Segment (Customer Segments)
// ============================================

export interface Segment {
    id: string;
    name: string;
    description?: string;
    filterCriteria: SegmentFilter[];
    customerCount: number;
    isActive: boolean;
    isDynamic: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface SegmentFilter {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: string | number | string[];
}

export interface SegmentListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
}

export interface SegmentListResponse {
    items: Segment[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateSegmentRequest {
    name: string;
    description?: string;
    filterCriteria: SegmentFilter[];
    isDynamic?: boolean;
}

export interface UpdateSegmentRequest extends Partial<CreateSegmentRequest> {}
