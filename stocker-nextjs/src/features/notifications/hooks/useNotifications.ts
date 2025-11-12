'use client';

import { create } from 'zustand';
import { Notification, NotificationFilter } from '../types/notification.types';
import { notificationsApi } from '../api/notifications-api';

import logger from '../../../lib/utils/logger';
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  filter: NotificationFilter;

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  setFilter: (filter: NotificationFilter) => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filter: {},

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsApi.getNotifications(get().filter);
      set({ notifications, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false
      });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark as read' });
    }
  },

  markAsUnread: async (notificationId: string) => {
    try {
      await notificationsApi.markAsUnread(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: false } : n
        ),
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark as unread' });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark all as read' });
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId);
        return {
          notifications: state.notifications.filter((n) => n.id !== notificationId),
          unreadCount: notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete notification' });
    }
  },

  setFilter: (filter: NotificationFilter) => {
    set({ filter });
    get().fetchNotifications();
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      // Silently fail - notifications are optional feature
      logger.warn('⚠️ Notification service unavailable:', error);
    }
  },
}));
