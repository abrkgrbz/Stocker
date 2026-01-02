// CRM Module Types

export interface Customer {
    id: string;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    type: CustomerType;
    status: CustomerStatus;
    tags?: string[];
    notes?: string;
    totalRevenue?: number;
    totalOrders?: number;
    lastActivityDate?: string;
    createdAt: string;
    updatedAt: string;
}

export type CustomerType = 'individual' | 'company';
export type CustomerStatus = 'active' | 'inactive' | 'lead' | 'prospect';

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
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    type: CustomerType;
    notes?: string;
    tags?: string[];
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
    status?: CustomerStatus;
}

// Deals / Opportunities

export interface Deal {
    id: string;
    title: string;
    customerId: string;
    customerName: string;
    value: number;
    currency: string;
    stage: DealStage;
    probability: number;
    expectedCloseDate?: string;
    actualCloseDate?: string;
    notes?: string;
    assignedTo?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
}

export type DealStage =
    | 'lead'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'won'
    | 'lost';

export interface DealListParams {
    page?: number;
    pageSize?: number;
    customerId?: string;
    stage?: DealStage;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DealListResponse {
    items: Deal[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Activities

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description?: string;
    customerId: string;
    customerName: string;
    dealId?: string;
    dueDate?: string;
    completedAt?: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
}

export type ActivityType =
    | 'call'
    | 'email'
    | 'meeting'
    | 'task'
    | 'note';

// Pipeline Stats

export interface PipelineStats {
    totalDeals: number;
    totalValue: number;
    byStage: {
        stage: DealStage;
        count: number;
        value: number;
    }[];
    wonThisMonth: number;
    lostThisMonth: number;
}
