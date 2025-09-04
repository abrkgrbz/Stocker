import { api } from '@/services/api';

export interface Lead {
  id: number;
  tenantId: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  industry?: string;
  source?: string;
  status: string;
  rating?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  description?: string;
  leadScore: number;
  lastActivityDate?: string;
  isConverted: boolean;
  convertedDate?: string;
  convertedCustomerId?: number;
  convertedContactId?: number;
  convertedOpportunityId?: number;
  ownerId?: number;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateLeadDto {
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  industry?: string;
  source?: string;
  status?: string;
  rating?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  description?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface ConvertLeadDto {
  createOpportunity: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  opportunityExpectedCloseDate?: string;
  createTask?: boolean;
  taskSubject?: string;
  taskDueDate?: string;
}

export interface LeadListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  rating?: string;
  source?: string;
  ownerId?: number;
  minScore?: number;
  maxScore?: number;
  isConverted?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface LeadListResponse {
  items: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class LeadService {
  private readonly baseUrl = '/api/crm/leads';

  async getLeads(params?: LeadListParams): Promise<LeadListResponse> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getLeadById(id: number): Promise<Lead> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createLead(data: CreateLeadDto): Promise<Lead> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateLead(id: number, data: UpdateLeadDto): Promise<Lead> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteLead(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async convertLead(id: number, data: ConvertLeadDto): Promise<{
    customerId: number;
    contactId: number;
    opportunityId?: number;
  }> {
    const response = await api.post(`${this.baseUrl}/${id}/convert`, data);
    return response.data;
  }

  async qualifyLead(id: number): Promise<Lead> {
    const response = await api.post(`${this.baseUrl}/${id}/qualify`);
    return response.data;
  }

  async disqualifyLead(id: number, reason: string): Promise<Lead> {
    const response = await api.post(`${this.baseUrl}/${id}/disqualify`, { reason });
    return response.data;
  }

  async assignLead(id: number, ownerId: number): Promise<Lead> {
    const response = await api.post(`${this.baseUrl}/${id}/assign`, { ownerId });
    return response.data;
  }

  async getLeadScore(id: number): Promise<{
    score: number;
    details: Array<{
      ruleName: string;
      points: number;
      applied: boolean;
    }>;
  }> {
    const response = await api.get(`${this.baseUrl}/${id}/score`);
    return response.data;
  }

  async recalculateScore(id: number): Promise<Lead> {
    const response = await api.post(`${this.baseUrl}/${id}/recalculate-score`);
    return response.data;
  }

  async getLeadActivities(id: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${id}/activities`);
    return response.data;
  }

  async getLeadNotes(id: number): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${id}/notes`);
    return response.data;
  }

  async bulkAssignLeads(leadIds: number[], ownerId: number): Promise<void> {
    await api.post(`${this.baseUrl}/bulk-assign`, { leadIds, ownerId });
  }

  async bulkUpdateStatus(leadIds: number[], status: string): Promise<void> {
    await api.post(`${this.baseUrl}/bulk-update-status`, { leadIds, status });
  }

  async exportLeads(params?: LeadListParams): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  async importLeads(file: File): Promise<{
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
}

export const leadService = new LeadService();