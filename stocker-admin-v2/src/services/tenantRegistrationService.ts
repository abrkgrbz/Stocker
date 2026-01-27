import { apiClient } from './apiClient';

export interface TenantRegistrationDto {
    id: string;
    registrationCode: string;
    companyName: string;
    companyCode: string;
    contactEmail: string;
    packageName: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired';
    registrationDate: string;
}

class TenantRegistrationService {
    private readonly basePath = '/api/master/tenants';

    async getPendingRegistrations(): Promise<TenantRegistrationDto[]> {
        const response: any = await apiClient.get('/api/master/tenants/registrations');
        return response;
    }

    async getStatistics(): Promise<any> {
        const response: any = await apiClient.get('/api/master/tenants/statistics');
        return response;
    }

    async approveRegistration(id: string): Promise<boolean> {
        const response: any = await apiClient.post(`/api/master/tenants/registrations/${id}/approve`);
        return !!response;
    }

    async rejectRegistration(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.basePath}/registrations/${id}/reject`, { reason });
        // @ts-ignore
        return response.success;
    }
}

export const tenantRegistrationService = new TenantRegistrationService();
