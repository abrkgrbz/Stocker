import api from '../api';

interface Opportunity {
  id: string;
  name: string;
  description?: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  status: 'open' | 'won' | 'lost';
  pipelineId?: string;
  pipelineName?: string;
  currentStageId?: string;
  currentStageName?: string;
  lostReason?: string;
  competitorName?: string;
  source?: string;
  ownerId?: string;
  ownerName?: string;
  score: number;
  weightedAmount: number;
  createdAt: string;
  updatedAt?: string;
}

interface CreateOpportunityRequest {
  name: string;
  description?: string;
  customerId: string;
  amount: number;
  currency?: string;
  probability: number;
  expectedCloseDate: string;
  pipelineId?: string;
  stageId?: string;
  source?: string;
  competitorName?: string;
}

interface OpportunityFilters {
  search?: string;
  status?: 'open' | 'won' | 'lost';
  customerId?: string;
  pipelineId?: string;
  stageId?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export const opportunityService = {
  getOpportunities: async (filters?: OpportunityFilters): Promise<Opportunity[]> => {
    const response = await api.get('/api/crm/opportunities', { params: filters });
    return response.data;
  },

  getOpportunity: async (id: string): Promise<Opportunity> => {
    const response = await api.get(`/api/crm/opportunities/${id}`);
    return response.data;
  },

  createOpportunity: async (data: CreateOpportunityRequest): Promise<Opportunity> => {
    const response = await api.post('/api/crm/opportunities', data);
    return response.data;
  },

  updateOpportunity: async (id: string, data: Partial<CreateOpportunityRequest>): Promise<Opportunity> => {
    const response = await api.put(`/api/crm/opportunities/${id}`, data);
    return response.data;
  },

  deleteOpportunity: async (id: string): Promise<void> => {
    await api.delete(`/api/crm/opportunities/${id}`);
  },

  moveToStage: async (opportunityId: string, stageId: string): Promise<Opportunity> => {
    const response = await api.post(`/api/crm/opportunities/${opportunityId}/move-stage`, { 
      opportunityId,
      stageId 
    });
    return response.data;
  },

  winOpportunity: async (id: string, details?: { actualCloseDate?: string; notes?: string }): Promise<Opportunity> => {
    const response = await api.post(`/api/crm/opportunities/${id}/win`, {
      id,
      ...details
    });
    return response.data;
  },

  loseOpportunity: async (id: string, data: { reason: string; competitorName?: string }): Promise<Opportunity> => {
    const response = await api.post(`/api/crm/opportunities/${id}/lose`, {
      id,
      ...data
    });
    return response.data;
  },

  getOpportunityActivities: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/crm/opportunities/${id}/activities`);
    return response.data;
  },

  getOpportunityProducts: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/crm/opportunities/${id}/products`);
    return response.data;
  },

  addProduct: async (opportunityId: string, data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage?: number;
  }): Promise<any> => {
    const response = await api.post(`/api/crm/opportunities/${opportunityId}/products`, {
      opportunityId,
      ...data
    });
    return response.data;
  },

  removeProduct: async (opportunityId: string, productId: string): Promise<void> => {
    await api.delete(`/api/crm/opportunities/${opportunityId}/products/${productId}`);
  },

  getPipelineReport: async (params?: {
    pipelineId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<any> => {
    const response = await api.get('/api/crm/opportunities/pipeline-report', { params });
    return response.data;
  },

  getSalesForecast: async (fromDate: string, toDate: string): Promise<any> => {
    const response = await api.get('/api/crm/opportunities/forecast', {
      params: { fromDate, toDate }
    });
    return response.data;
  }
};