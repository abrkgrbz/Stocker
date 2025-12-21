import { apiClient, ApiResponse } from './client';
import type {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  GetRemindersResponse,
  SnoozeReminderRequest,
} from '@/types/reminder';

export const remindersApi = {
  getReminders: async (params?: {
    pendingOnly?: boolean;
    skip?: number;
    take?: number;
    assignedToUserId?: string;
  }): Promise<GetRemindersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.pendingOnly !== undefined)
      queryParams.append('pendingOnly', String(params.pendingOnly));
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.take !== undefined) queryParams.append('take', String(params.take));
    if (params?.assignedToUserId)
      queryParams.append('assignedToUserId', params.assignedToUserId);

    const query = queryParams.toString();
    const url = query ? `/api/crm/Reminders?${query}` : '/api/crm/Reminders';

    const response = await apiClient.get<ApiResponse<GetRemindersResponse>>(url);
    return (response.data as any).data || response.data;
  },

  createReminder: async (data: CreateReminderRequest): Promise<number> => {
    const response = await apiClient.post<ApiResponse<number>>('/api/crm/Reminders', data);
    return (response.data as any).data || response.data;
  },

  updateReminder: async (id: number, data: UpdateReminderRequest): Promise<void> => {
    await apiClient.put(`/api/crm/Reminders/${id}`, data);
  },

  snoozeReminder: async (id: number, minutes: number): Promise<void> => {
    await apiClient.post(`/api/crm/Reminders/${id}/snooze`, { minutes } as SnoozeReminderRequest);
  },

  completeReminder: async (id: number): Promise<void> => {
    await apiClient.post(`/api/crm/Reminders/${id}/complete`);
  },

  deleteReminder: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/crm/Reminders/${id}`);
  },
};
