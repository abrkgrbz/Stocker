import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
// =====================================

export interface Customer {
  id: number;
  companyName: string;
  contactPerson: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  customerType: 'Individual' | 'Corporate';
  status: 'Active' | 'Inactive' | 'Potential';
  creditLimit: number;
  taxId: string | null;
  paymentTerms: string | null;
  notes: string | null;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: 'Website' | 'Referral' | 'SocialMedia' | 'Event' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
  score: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: number;
  title: string;
  customerId: number | null;
  pipelineId: number;
  stageId: number;
  amount: number;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  status: 'Open' | 'Won' | 'Lost';
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  title: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  description: string | null;
  startTime: string;
  endTime: string | null;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  customerId: number | null;
  leadId: number | null;
  dealId: number | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CustomerFilters {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  customerType?: 'Individual' | 'Corporate';
  status?: 'Active' | 'Inactive' | 'Potential';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerDto {
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  customerType: 'Individual' | 'Corporate';
  creditLimit?: number;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// =====================================
// CRM API SERVICE
// =====================================

export class CRMService {
  /**
   * Get tenant ID from localStorage
   * Backend expects URLs like: /api/tenants/{tenantId}/customers
   */
  private static getTenantId(): string {
    if (typeof window === 'undefined') {
      throw new Error('CRMService can only be used in browser context');
    }

    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID not found in localStorage');
    }

    return tenantId;
  }

  /**
   * Build tenant-aware API path
   * @param resource - Resource path (e.g., 'customers', 'leads')
   * @returns Full API path with tenant ID
   */
  private static getPath(resource: string): string {
    const tenantId = this.getTenantId();
    return `/api/tenants/${tenantId}/${resource}`;
  }

  // =====================================
  // CUSTOMERS
  // =====================================

  /**
   * Get all customers with pagination and filters
   */
  static async getCustomers(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Customer>> {
    return ApiService.get<PaginatedResponse<Customer>>(
      this.getPath('customers'),
      { params: filters }
    );
  }

  /**
   * Get single customer by ID
   */
  static async getCustomer(id: number): Promise<Customer> {
    return ApiService.get<Customer>(this.getPath(`customers/${id}`));
  }

  /**
   * Create new customer
   */
  static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    return ApiService.post<Customer>(this.getPath('customers'), data);
  }

  /**
   * Update existing customer
   */
  static async updateCustomer(
    id: number,
    data: UpdateCustomerDto
  ): Promise<Customer> {
    return ApiService.put<Customer>(
      this.getPath(`customers/${id}`),
      data
    );
  }

  /**
   * Delete customer
   */
  static async deleteCustomer(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`customers/${id}`));
  }

  // =====================================
  // LEADS
  // =====================================

  /**
   * Get all leads with pagination
   */
  static async getLeads(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Lead>> {
    return ApiService.get<PaginatedResponse<Lead>>(this.getPath('leads'), {
      params: filters,
    });
  }

  /**
   * Get single lead by ID
   */
  static async getLead(id: number): Promise<Lead> {
    return ApiService.get<Lead>(this.getPath(`leads/${id}`));
  }

  // =====================================
  // DEALS
  // =====================================

  /**
   * Get all deals with pagination
   */
  static async getDeals(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Deal>> {
    return ApiService.get<PaginatedResponse<Deal>>(this.getPath('deals'), {
      params: filters,
    });
  }

  /**
   * Get single deal by ID
   */
  static async getDeal(id: number): Promise<Deal> {
    return ApiService.get<Deal>(this.getPath(`deals/${id}`));
  }

  // =====================================
  // ACTIVITIES
  // =====================================

  /**
   * Get all activities with pagination
   */
  static async getActivities(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Activity>> {
    return ApiService.get<PaginatedResponse<Activity>>(
      this.getPath('activities'),
      { params: filters }
    );
  }

  /**
   * Get single activity by ID
   */
  static async getActivity(id: number): Promise<Activity> {
    return ApiService.get<Activity>(this.getPath(`activities/${id}`));
  }
}

export default CRMService;
