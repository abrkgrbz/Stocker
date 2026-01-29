
import { apiClient } from '../client';

export interface SalesCustomer {
    id: string;
    name: string;
    code: string;
    taxId?: string;
    taxOffice?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    currency: string;
    paymentTermId?: string;
    isActive: boolean;
    balance?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSalesCustomerRequest {
    name: string;
    code?: string; // Optional, auto-generated if empty
    taxId?: string;
    taxOffice?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    currency: string;
    paymentTermId?: string;
}

export interface UpdateSalesCustomerRequest extends Partial<CreateSalesCustomerRequest> {
    isActive?: boolean;
}

class SalesCustomerService {
    private customBaseUrl = '/api/sales/customers';

    async getAll(): Promise<SalesCustomer[]> {
        const response = await apiClient.get<SalesCustomer[]>(this.customBaseUrl);
        return response.data || [];
    }

    async getById(id: string): Promise<SalesCustomer> {
        const response = await apiClient.get<SalesCustomer>(`${this.customBaseUrl}/${id}`);
        if (!response.data) throw new Error('Customer not found');
        return response.data;
    }

    async create(data: CreateSalesCustomerRequest): Promise<SalesCustomer> {
        const response = await apiClient.post<SalesCustomer>(this.customBaseUrl, data);
        if (!response.data) throw new Error('Failed to create customer');
        return response.data;
    }

    async update(id: string, data: UpdateSalesCustomerRequest): Promise<SalesCustomer> {
        const response = await apiClient.put<SalesCustomer>(`${this.customBaseUrl}/${id}`, data);
        if (!response.data) throw new Error('Failed to update customer');
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${this.customBaseUrl}/${id}`);
    }
}

export const salesCustomerService = new SalesCustomerService();
