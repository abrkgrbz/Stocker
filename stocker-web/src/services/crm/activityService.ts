import api from '../api';

interface Activity {
  id: string;
  subject: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completedAt?: string;
  duration?: number;
  location?: string;
  leadId?: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
  dealId?: string;
  assignedToId?: string;
  outcome?: string;
  notes?: string;
}

interface CreateActivityRequest {
  subject: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  duration?: number;
  location?: string;
  leadId?: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
  dealId?: string;
  assignedToId?: string;
}

interface ActivityFilters {
  type?: 'call' | 'email' | 'meeting' | 'task' | 'note';
  status?: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  leadId?: string;
  customerId?: string;
  opportunityId?: string;
  dealId?: string;
  assignedToId?: string;
  fromDate?: string;
  toDate?: string;
  overdue?: boolean;
  page?: number;
  pageSize?: number;
}

interface CompleteActivityRequest {
  outcome?: string;
  notes?: string;
}

interface ActivityStatistics {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  overdueActivities: number;
  completionRate: number;
  activitiesByType: Record<string, number>;
  activitiesByStatus: Record<string, number>;
}

export const activityService = {
  getActivities: async (filters?: ActivityFilters): Promise<Activity[]> => {
    const response = await api.get('/api/crm/activities', { params: filters });
    return response.data;
  },

  getActivity: async (id: string): Promise<Activity> => {
    const response = await api.get(`/api/crm/activities/${id}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityRequest): Promise<Activity> => {
    const response = await api.post('/api/crm/activities', data);
    return response.data;
  },

  updateActivity: async (id: string, data: Partial<CreateActivityRequest>): Promise<Activity> => {
    const response = await api.put(`/api/crm/activities/${id}`, { id, ...data });
    return response.data;
  },

  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/api/crm/activities/${id}`);
  },

  completeActivity: async (id: string, data?: CompleteActivityRequest): Promise<Activity> => {
    const response = await api.post(`/api/crm/activities/${id}/complete`, { 
      id,
      ...data 
    });
    return response.data;
  },

  cancelActivity: async (id: string, reason?: string): Promise<Activity> => {
    const response = await api.post(`/api/crm/activities/${id}/cancel`, { 
      id,
      reason 
    });
    return response.data;
  },

  rescheduleActivity: async (id: string, newDate: string): Promise<Activity> => {
    const response = await api.post(`/api/crm/activities/${id}/reschedule`, {
      id,
      newDate
    });
    return response.data;
  },

  getUpcomingActivities: async (days: number = 7, assignedToId?: string): Promise<Activity[]> => {
    const response = await api.get('/api/crm/activities/upcoming', {
      params: { days, assignedToId }
    });
    return response.data;
  },

  getOverdueActivities: async (assignedToId?: string): Promise<Activity[]> => {
    const response = await api.get('/api/crm/activities/overdue', {
      params: { assignedToId }
    });
    return response.data;
  },

  getCalendarActivities: async (startDate: string, endDate: string, assignedToId?: string): Promise<Activity[]> => {
    const response = await api.get('/api/crm/activities/calendar', {
      params: { startDate, endDate, assignedToId }
    });
    return response.data;
  },

  getActivityStatistics: async (params?: {
    fromDate?: string;
    toDate?: string;
    assignedToId?: string;
  }): Promise<ActivityStatistics> => {
    const response = await api.get('/api/crm/activities/statistics', { params });
    return response.data;
  }
};