import { Notification, NotificationFilter } from '../types/notification.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';

export const notificationsApi = {
  // Get all notifications with optional filters
  getNotifications: async (filter?: NotificationFilter): Promise<Notification[]> => {
    const params = new URLSearchParams();

    if (filter?.type) params.append('type', filter.type);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.isRead !== undefined) params.append('isRead', String(filter.isRead));
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter?.dateTo) params.append('dateTo', filter.dateTo.toISOString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/notifications${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.data || [];
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark notification as unread
  markAsUnread: async (notificationId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/unread`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as unread');
    }
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/read-all`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/unread-count`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    const data = await response.json();

    // Handle different response formats from API
    // Backend may return: { data: 5 } or { unreadCount: 5 } or { data: { unreadCount: 5 } }
    if (typeof data.data === 'number') {
      return data.data;
    }
    if (typeof data.data?.unreadCount === 'number') {
      return data.data.unreadCount;
    }
    if (typeof data.unreadCount === 'number') {
      return data.unreadCount;
    }

    return 0;
  },
};
