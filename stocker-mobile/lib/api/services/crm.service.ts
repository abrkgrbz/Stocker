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
        const response = await api.get<CustomerListResponse>(`${this.baseUrl}/customers`, { params });
        return response.data;
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
        const response = await api.get<DealListResponse>(`${this.baseUrl}/deals`, { params });
        return response.data;
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
