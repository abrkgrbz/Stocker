// =====================================
// ALERTS SERVICE
// Central Alert System API
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type { Alert, AlertFilterParams, UnreadCountResponse } from '../types';

const BASE_URL = '/alerts';

export const alertService = {
  /**
   * Get alerts for the current user
   */
  async getAlerts(params?: AlertFilterParams): Promise<Alert[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.category) queryParams.append('category', params.category);
      if (params.minSeverity) queryParams.append('minSeverity', params.minSeverity);
      if (params.sourceModule) queryParams.append('sourceModule', params.sourceModule);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params.includeDismissed !== undefined) queryParams.append('includeDismissed', params.includeDismissed.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    return ApiService.get<Alert[]>(url);
  },

  /**
   * Get unread alert count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return ApiService.get<UnreadCountResponse>(`${BASE_URL}/unread-count`);
  },

  /**
   * Mark an alert as read
   */
  async markAsRead(id: number): Promise<void> {
    return ApiService.post<void>(`${BASE_URL}/${id}/read`);
  },

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(): Promise<void> {
    return ApiService.post<void>(`${BASE_URL}/read-all`);
  },

  /**
   * Dismiss an alert
   */
  async dismissAlert(id: number): Promise<void> {
    return ApiService.post<void>(`${BASE_URL}/${id}/dismiss`);
  },
};
