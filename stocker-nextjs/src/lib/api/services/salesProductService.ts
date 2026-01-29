
import { apiClient } from '../client';

export interface SalesProduct {
    id: string;
    name: string;
    code: string;
    description?: string;
    unit: string;
    unitPrice: number;
    currency: string;
    taxRate: number;
    category?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSalesProductRequest {
    name: string;
    code?: string;
    description?: string;
    unit: string;
    unitPrice: number;
    currency: string;
    taxRate: number;
    category?: string;
}

export interface UpdateSalesProductRequest extends Partial<CreateSalesProductRequest> {
    isActive?: boolean;
}

class SalesProductService {
    private customBaseUrl = '/api/sales/products';

    async getAll(): Promise<SalesProduct[]> {
        const response = await apiClient.get<SalesProduct[]>(this.customBaseUrl);
        return response.data || [];
    }

    async getById(id: string): Promise<SalesProduct> {
        const response = await apiClient.get<SalesProduct>(`${this.customBaseUrl}/${id}`);
        if (!response.data) throw new Error('Product not found');
        return response.data;
    }

    async create(data: CreateSalesProductRequest): Promise<SalesProduct> {
        const response = await apiClient.post<SalesProduct>(this.customBaseUrl, data);
        if (!response.data) throw new Error('Failed to create product');
        return response.data;
    }

    async update(id: string, data: UpdateSalesProductRequest): Promise<SalesProduct> {
        const response = await apiClient.put<SalesProduct>(`${this.customBaseUrl}/${id}`, data);
        if (!response.data) throw new Error('Failed to update product');
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${this.customBaseUrl}/${id}`);
    }
}

export const salesProductService = new SalesProductService();
