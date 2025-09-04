import api from '../api';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'deal';
  isActive: boolean;
  isDefault: boolean;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  description?: string;
  order: number;
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
}

interface CreatePipelineRequest {
  name: string;
  description?: string;
  type: 'sales' | 'deal';
  isDefault?: boolean;
}

interface CreateStageRequest {
  pipelineId: string;
  name: string;
  description?: string;
  order: number;
  probability: number;
  color: string;
}

export const pipelineService = {
  getPipelines: async (): Promise<Pipeline[]> => {
    const response = await api.get('/api/crm/pipelines');
    return response.data;
  },

  getPipeline: async (id: string): Promise<Pipeline> => {
    const response = await api.get(`/api/crm/pipelines/${id}`);
    return response.data;
  },

  createPipeline: async (data: CreatePipelineRequest): Promise<Pipeline> => {
    const response = await api.post('/api/crm/pipelines', data);
    return response.data;
  },

  updatePipeline: async (id: string, data: Partial<CreatePipelineRequest>): Promise<Pipeline> => {
    const response = await api.put(`/api/crm/pipelines/${id}`, data);
    return response.data;
  },

  deletePipeline: async (id: string): Promise<void> => {
    await api.delete(`/api/crm/pipelines/${id}`);
  },

  getPipelineStages: async (pipelineId: string): Promise<PipelineStage[]> => {
    const response = await api.get(`/api/crm/pipelines/${pipelineId}/stages`);
    return response.data;
  },

  addStage: async (data: CreateStageRequest): Promise<PipelineStage> => {
    const response = await api.post(`/api/crm/pipelines/${data.pipelineId}/stages`, data);
    return response.data;
  },

  updateStage: async (pipelineId: string, stageId: string, data: Partial<CreateStageRequest>): Promise<PipelineStage> => {
    const response = await api.put(`/api/crm/pipelines/${pipelineId}/stages/${stageId}`, data);
    return response.data;
  },

  removeStage: async (pipelineId: string, stageId: string): Promise<void> => {
    await api.delete(`/api/crm/pipelines/${pipelineId}/stages/${stageId}`);
  },

  reorderStages: async (pipelineId: string, stageIds: string[]): Promise<PipelineStage[]> => {
    const response = await api.post(`/api/crm/pipelines/${pipelineId}/stages/reorder`, { stageIds });
    return response.data;
  },

  activatePipeline: async (id: string): Promise<Pipeline> => {
    const response = await api.post(`/api/crm/pipelines/${id}/activate`);
    return response.data;
  },

  deactivatePipeline: async (id: string): Promise<Pipeline> => {
    const response = await api.post(`/api/crm/pipelines/${id}/deactivate`);
    return response.data;
  },

  getPipelineStatistics: async (id: string): Promise<any> => {
    const response = await api.get(`/api/crm/pipelines/${id}/statistics`);
    return response.data;
  }
};