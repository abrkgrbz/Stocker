// CRM Module Types

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
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    isPrimary: boolean;
}

export type CustomerType = 'Individual' | 'Corporate' | 'Government' | 'NonProfit';
export type CustomerStatus = 'Active' | 'Inactive' | 'Prospect' | 'Suspended';

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

export interface CreateDealRequest {
    title: string;
    customerId: string;
    value: number;
    currency?: string;
    stage?: DealStage;
    probability?: number;
    expectedCloseDate?: string;
    notes?: string;
    assignedTo?: string;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {}

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
