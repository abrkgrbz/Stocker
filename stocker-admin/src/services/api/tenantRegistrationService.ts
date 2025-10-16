import { apiClient } from './apiClient';

// DTOs matching backend TenantRegistration
export interface TenantRegistrationDto {
  id: string;
  registrationCode: string;
  companyName: string;
  companyCode: string;
  contactEmail: string;
  contactPhone: string;
  adminEmail: string;
  adminUsername: string;
  adminFirstName: string;
  adminLastName: string;
  packageName: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired';
  registrationDate: string;
  approvalDate?: string;
  rejectionDate?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerified: boolean;
}

export interface CreateTenantFromRegistrationCommand {
  registrationId: string;
}

export interface GetTenantRegistrationsQuery {
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired' | 'All';
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

class TenantRegistrationService {
  private readonly basePath = '/api/master/tenants';
  private readonly publicPath = '/api/public/tenant-registration';

  /**
   * Get all pending tenant registrations (requires admin auth)
   */
  async getPendingRegistrations(query?: GetTenantRegistrationsQuery): Promise<TenantRegistrationDto[]> {
    // Note: Backend doesn't have a dedicated endpoint yet, we'll need to add one
    // For now, we'll call a placeholder that should be implemented
    return apiClient.get<TenantRegistrationDto[]>(`${this.basePath}/registrations`, query);
  }

  /**
   * Get registration by ID
   */
  async getById(id: string): Promise<TenantRegistrationDto> {
    return apiClient.get<TenantRegistrationDto>(`${this.basePath}/registrations/${id}`);
  }

  /**
   * Get registration by code (public endpoint)
   */
  async getByCode(registrationCode: string): Promise<TenantRegistrationDto> {
    return apiClient.get<TenantRegistrationDto>(`${this.publicPath}/status/${registrationCode}`);
  }

  /**
   * Approve registration and create tenant
   */
  async approveRegistration(registrationId: string): Promise<boolean> {
    const command: CreateTenantFromRegistrationCommand = { registrationId };
    try {
      await apiClient.post<any>(`${this.basePath}/from-registration`, command);
      return true;
    } catch (error) {
      console.error('Failed to approve registration:', error);
      return false;
    }
  }

  /**
   * Reject registration
   */
  async rejectRegistration(registrationId: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post<boolean>(`${this.basePath}/registrations/${registrationId}/reject`, { reason });
      return true;
    } catch (error) {
      console.error('Failed to reject registration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tenantRegistrationService = new TenantRegistrationService();
