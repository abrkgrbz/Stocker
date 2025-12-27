import { apiClient } from '../client';
import type { ApiResponse, PaginationParams, FilterParams } from '../types';
import type { CustomerFormData } from '@/features/customers/schemas/customer-schema';

/**
 * Customer Response Types
 */
export interface Customer extends CustomerFormData {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerFilters extends FilterParams {
  type?: 'individual' | 'corporate';
  segment?: 'retail' | 'wholesale' | 'corporate' | 'vip';
  status?: 'active' | 'inactive' | 'blocked';
  city?: string;
}

/**
 * Customer Service
 */
export class CustomerService {
  /**
   * Get all customers with pagination and filters
   */
  async getCustomers(
    params?: PaginationParams & CustomerFilters
  ): Promise<ApiResponse<CustomerListResponse>> {
    return apiClient.get<CustomerListResponse>('/api/customers', params);
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<Customer>(`/api/customers/${id}`);
  }

  /**
   * Create new customer
   */
  async createCustomer(data: CustomerFormData): Promise<ApiResponse<Customer>> {
    return apiClient.post<Customer>('/api/customers', data);
  }

  /**
   * Update existing customer
   */
  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> {
    return apiClient.put<Customer>(`/api/customers/${id}`, data);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(`/api/customers/${id}`);
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<Customer[]>('/api/customers/search', { q: query });
  }

  /**
   * Get customer by tax ID
   */
  async getCustomerByTaxId(taxId: string): Promise<ApiResponse<Customer | null>> {
    return apiClient.get<Customer | null>('/api/customers/by-tax-id', { taxId });
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    blocked: number;
    bySegment: Record<string, number>;
    byType: Record<string, number>;
  }>> {
    return apiClient.get('/api/customers/stats');
  }

  /**
   * Block/Unblock customer
   */
  async toggleCustomerStatus(
    id: string,
    status: 'active' | 'inactive' | 'blocked'
  ): Promise<ApiResponse<Customer>> {
    return apiClient.patch<Customer>(`/api/customers/${id}/status`, { status });
  }

  /**
   * Get customer transactions
   */
  async getCustomerTransactions(
    id: string,
    params?: PaginationParams
  ): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/customers/${id}/transactions`, params);
  }

  /**
   * Get customer balance
   */
  async getCustomerBalance(id: string): Promise<ApiResponse<{
    balance: number;
    creditLimit: number;
    availableCredit: number;
    overdueAmount: number;
  }>> {
    return apiClient.get(`/api/customers/${id}/balance`);
  }
}

/**
 * Export singleton instance
 */
export const customerService = new CustomerService();
