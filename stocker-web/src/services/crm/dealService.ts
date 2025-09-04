import api from '../api';

interface Deal {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  pipelineId?: string;
  pipelineName?: string;
  currentStageId?: string;
  currentStageName?: string;
  expectedCloseDate: string;
  actualCloseDate?: string;
  probability: number;
  lostReason?: string;
  wonDetails?: string;
  competitorName?: string;
  source?: string;
  ownerId?: string;
  ownerName?: string;
  weightedAmount: number;
  createdAt: string;
  updatedAt?: string;
}

interface CreateDealRequest {
  title: string;
  description?: string;
  customerId: string;
  amount: number;
  currency?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  pipelineId?: string;
  stageId?: string;
  expectedCloseDate: string;
  probability: number;
  source?: string;
  competitorName?: string;
}

interface DealFilters {
  search?: string;
  status?: 'open' | 'won' | 'lost' | 'pending';
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

export const dealService = {
  getDeals: async (filters?: DealFilters): Promise<Deal[]> => {
    const response = await api.get('/api/crm/deals', { params: filters });
    return response.data;
  },

  getDeal: async (id: string): Promise<Deal> => {
    const response = await api.get(`/api/crm/deals/${id}`);
    return response.data;
  },

  createDeal: async (data: CreateDealRequest): Promise<Deal> => {
    const response = await api.post('/api/crm/deals', data);
    return response.data;
  },

  updateDeal: async (id: string, data: Partial<CreateDealRequest>): Promise<Deal> => {
    const response = await api.put(`/api/crm/deals/${id}`, data);
    return response.data;
  },

  deleteDeal: async (id: string): Promise<void> => {
    await api.delete(`/api/crm/deals/${id}`);
  },

  moveToStage: async (dealId: string, stageId: string): Promise<Deal> => {
    const response = await api.post(`/api/crm/deals/${dealId}/move-stage`, { 
      dealId,
      stageId 
    });
    return response.data;
  },

  closeWon: async (id: string, details?: { actualCloseDate?: string; wonDetails?: string }): Promise<Deal> => {
    const response = await api.post(`/api/crm/deals/${id}/close-won`, {
      id,
      ...details
    });
    return response.data;
  },

  closeLost: async (id: string, data: { reason: string; competitorName?: string }): Promise<Deal> => {
    const response = await api.post(`/api/crm/deals/${id}/close-lost`, {
      id,
      lostReason: data.reason,
      competitorName: data.competitorName
    });
    return response.data;
  },

  getDealActivities: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/crm/deals/${id}/activities`);
    return response.data;
  },

  getDealProducts: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/crm/deals/${id}/products`);
    return response.data;
  },

  addProduct: async (dealId: string, data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage?: number;
  }): Promise<any> => {
    const response = await api.post(`/api/crm/deals/${dealId}/products`, {
      dealId,
      ...data
    });
    return response.data;
  },

  removeProduct: async (dealId: string, productId: string): Promise<void> => {
    await api.delete(`/api/crm/deals/${dealId}/products/${productId}`);
  },

  getDealStatistics: async (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<any> => {
    const response = await api.get('/api/crm/deals/statistics', { params });
    return response.data;
  },

  getConversionRates: async (params?: {
    pipelineId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<any> => {
    const response = await api.get('/api/crm/deals/conversion-rates', { params });
    return response.data;
  }
};