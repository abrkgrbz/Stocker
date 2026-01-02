import api from '@/lib/axios';
import type {
    Customer,
    CustomerListParams,
    CustomerListResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    Deal,
    DealListParams,
    DealListResponse,
    Activity,
    PipelineStats,
} from '../types/crm.types';

class CRMService {
    private readonly baseUrl = '/crm';

    // Customers
    async getCustomers(params?: CustomerListParams): Promise<CustomerListResponse> {
        // Use paged endpoint to get totalCount for dashboard metrics
        const response = await api.get<{
            items: Customer[];
            pageNumber: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
        }>(`${this.baseUrl}/customers/paged`, {
            params: {
                pageNumber: params?.page || 1,
                pageSize: params?.pageSize || 20,
                searchTerm: params?.search,
                sortBy: params?.sortBy,
                sortDescending: params?.sortOrder === 'desc',
            }
        });

        // Map backend response to mobile types
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

    // Deals
    async getDeals(params?: DealListParams): Promise<DealListResponse> {
        // Backend returns array, not paged response - we need to map it
        const response = await api.get<Deal[]>(`${this.baseUrl}/deals`, {
            params: {
                search: params?.search,
                status: params?.stage, // Map stage to status for backend
                customerId: params?.customerId,
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

    async getDeal(id: string): Promise<Deal> {
        const response = await api.get<Deal>(`${this.baseUrl}/deals/${id}`);
        return response.data;
    }

    async updateDealStage(id: string, stage: string): Promise<Deal> {
        const response = await api.patch<Deal>(`${this.baseUrl}/deals/${id}/stage`, { stage });
        return response.data;
    }

    // Activities
    async getCustomerActivities(customerId: string): Promise<Activity[]> {
        const response = await api.get<Activity[]>(`${this.baseUrl}/customers/${customerId}/activities`);
        return response.data;
    }

    // Pipeline Stats
    async getPipelineStats(): Promise<PipelineStats> {
        const response = await api.get<PipelineStats>(`${this.baseUrl}/pipeline/stats`);
        return response.data;
    }

    // Search
    async searchCustomers(query: string): Promise<Customer[]> {
        const response = await api.get<Customer[]>(`${this.baseUrl}/customers/search`, {
            params: { q: query }
        });
        return response.data;
    }
}

export const crmService = new CRMService();
export default crmService;
