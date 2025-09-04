import { api } from '@/services/api';

export interface Customer {
  id: number;
  tenantId: string;
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  taxOffice?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  description?: string;
  customerType?: string;
  segment?: string;
  rating?: number;
  creditLimit?: number;
  paymentTerms?: number;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  contacts: Contact[];
  opportunities: any[];
  deals: any[];
}

export interface Contact {
  id: number;
  customerId?: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  contactType?: string;
  isPrimary: boolean;
  birthDate?: string;
  socialLinkedIn?: string;
  socialTwitter?: string;
  notes?: string;
  isActive: boolean;
}

export interface CreateCustomerDto {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  taxOffice?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  description?: string;
  customerType?: string;
  segment?: string;
  creditLimit?: number;
  paymentTerms?: number;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CreateContactDto {
  customerId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  contactType?: string;
  isPrimary?: boolean;
  birthDate?: string;
  socialLinkedIn?: string;
  socialTwitter?: string;
  notes?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  industry?: string;
  segment?: string;
  customerType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CustomerListResponse {
  items: Customer[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class CustomerService {
  private readonly baseUrl = '/api/crm/customers';

  async getCustomers(params?: CustomerListParams): Promise<CustomerListResponse> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async getCustomerContacts(customerId: number): Promise<Contact[]> {
    const response = await api.get(`${this.baseUrl}/${customerId}/contacts`);
    return response.data;
  }

  async addContact(customerId: number, data: CreateContactDto): Promise<Contact> {
    const response = await api.post(`${this.baseUrl}/${customerId}/contacts`, data);
    return response.data;
  }

  async updateContact(customerId: number, contactId: number, data: UpdateContactDto): Promise<Contact> {
    const response = await api.put(`${this.baseUrl}/${customerId}/contacts/${contactId}`, data);
    return response.data;
  }

  async removeContact(customerId: number, contactId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${customerId}/contacts/${contactId}`);
  }

  async getCustomerOpportunities(customerId: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${customerId}/opportunities`);
    return response.data;
  }

  async getCustomerDeals(customerId: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${customerId}/deals`);
    return response.data;
  }

  async getCustomerActivities(customerId: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${customerId}/activities`);
    return response.data;
  }

  async getCustomerNotes(customerId: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${customerId}/notes`);
    return response.data;
  }

  async getCustomerRevenue(customerId: number): Promise<{
    totalRevenue: number;
    yearlyRevenue: Array<{
      year: number;
      revenue: number;
    }>;
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
    }>;
  }> {
    const response = await api.get(`${this.baseUrl}/${customerId}/revenue`);
    return response.data;
  }

  async exportCustomers(params?: CustomerListParams): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  async importCustomers(file: File): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async mergeCustomers(primaryId: number, secondaryId: number): Promise<Customer> {
    const response = await api.post(`${this.baseUrl}/merge`, {
      primaryId,
      secondaryId
    });
    return response.data;
  }

  async getCustomerSegments(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/segments`);
    return response.data;
  }

  async getIndustries(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/industries`);
    return response.data;
  }
}

export const customerService = new CustomerService();