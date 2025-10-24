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
  totalPurchases: number | null;
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
   * Build CRM module API path
   * @param resource - Resource path (e.g., 'customers', 'leads')
   * @returns CRM API path (without /api prefix as it's in baseURL)
   *
   * CRM module uses: /api/crm/{resource}
   * Tenant context is handled by backend middleware via X-Tenant-Code header (not in URL)
   */
  private static getPath(resource: string): string {
    // CRM module route pattern
    return `/crm/${resource}`;
  }

  // =====================================
  // CUSTOMERS
  // =====================================

  /**
   * Get all customers with pagination and filters
   * Uses CRM module's GetCustomersPagedQuery
   */
  static async getCustomers(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Customer>> {
    // CRM module uses /paged endpoint for pagination
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.search,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortOrder === 'desc',
      includeInactive: filters?.status === 'Inactive',
    };

    return ApiService.get<PaginatedResponse<Customer>>(
      this.getPath('customers/paged'),
      { params }
    );
  }

  /**
   * Get single customer by ID
   */
  static async getCustomer(id: number): Promise<Customer> {
    return ApiService.get<Customer>(this.getPath(`customers/${id}`));
  }

  /**
   * Format phone number to E.164 format expected by backend
   * Converts: 05532078250 → +905532078250
   */
  private static formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with +90 (Turkey)
    if (cleaned.startsWith('0')) {
      return '+90' + cleaned.substring(1);
    }

    // If doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Create new customer using CRM module's CreateCustomerCommand
   */
  static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    // CRM module expects: CreateCustomerCommand { CustomerData: CreateCustomerDto }
    // CreateCustomerDto matches our frontend DTO structure
    const command = {
      CustomerData: {
        CompanyName: data.companyName,
        Email: data.email,
        Phone: this.formatPhoneNumber(data.phone),
        Website: data.website || null,
        Industry: null, // Not collected in frontend yet
        Address: data.address || null,
        City: data.city || null,
        State: data.state || null,
        Country: data.country || null,
        PostalCode: data.postalCode || null,
        AnnualRevenue: null, // Not collected in frontend yet
        NumberOfEmployees: null, // Not collected in frontend yet
        Description: data.notes || null,
      }
    };

    console.log('📤 Sending CreateCustomerCommand to CRM module:', command);
    return ApiService.post<Customer>(this.getPath('customers'), command);
  }

  /**
   * Update existing customer using CRM module's UpdateCustomerCommand
   */
  static async updateCustomer(
    id: number,
    data: UpdateCustomerDto
  ): Promise<Customer> {
    // CRM module expects: UpdateCustomerCommand { CustomerId, CustomerData }
    const command = {
      CustomerId: id,
      CustomerData: {
        CompanyName: data.companyName,
        Email: data.email,
        Phone: data.phone ? this.formatPhoneNumber(data.phone) : undefined,
        Website: data.website,
        Industry: null,
        Address: data.address,
        City: data.city,
        State: data.state,
        Country: data.country,
        PostalCode: data.postalCode,
        AnnualRevenue: null,
        NumberOfEmployees: null,
        Description: data.notes,
      }
    };

    console.log('📤 Sending UpdateCustomerCommand to CRM module:', command);
    return ApiService.put<Customer>(
      this.getPath(`customers/${id}`),
      command
    );
  }

  /**
   * Delete customer using CRM module's DeleteCustomerCommand
   */
  static async deleteCustomer(id: number): Promise<void> {
    console.log('📤 Sending DeleteCustomerCommand to CRM module:', { customerId: id });
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

  /**
   * Create new lead
   */
  static async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return ApiService.post<Lead>(this.getPath('leads'), data);
  }

  /**
   * Update existing lead
   */
  static async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    return ApiService.put<Lead>(this.getPath(`leads/${id}`), { id, ...data });
  }

  /**
   * Delete lead
   */
  static async deleteLead(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`leads/${id}`));
  }

  /**
   * Convert lead to customer
   */
  static async convertLeadToCustomer(leadId: number, customerData: CreateCustomerDto): Promise<Customer> {
    return ApiService.post<Customer>(this.getPath(`leads/${leadId}/convert`), customerData);
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

  /**
   * Create new deal
   */
  static async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    return ApiService.post<Deal>(this.getPath('deals'), data);
  }

  /**
   * Update existing deal
   */
  static async updateDeal(id: number, data: Partial<Deal>): Promise<Deal> {
    return ApiService.put<Deal>(this.getPath(`deals/${id}`), { id, ...data });
  }

  /**
   * Delete deal
   */
  static async deleteDeal(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`deals/${id}`));
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

  /**
   * Create new activity
   */
  static async createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    return ApiService.post<Activity>(this.getPath('activities'), data);
  }

  /**
   * Update existing activity
   */
  static async updateActivity(id: number, data: Partial<Activity>): Promise<Activity> {
    return ApiService.put<Activity>(this.getPath(`activities/${id}`), { id, ...data });
  }

  /**
   * Delete activity
   */
  static async deleteActivity(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`activities/${id}`));
  }

  /**
   * Mark activity as completed
   */
  static async completeActivity(id: number): Promise<Activity> {
    return ApiService.patch<Activity>(this.getPath(`activities/${id}/complete`), {});
  }
}

export default CRMService;
