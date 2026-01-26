// =====================================
// ALERTS HOOKS
// TanStack Query v5 - Central Alert System
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../services/alert.service';
import { queryOptions } from '@/lib/api/query-options';
import type { Alert, AlertFilterParams, UnreadCountResponse } from '../types';

// Query keys
export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params?: AlertFilterParams) => [...alertKeys.lists(), params] as const,
  unreadCount: () => [...alertKeys.all, 'unread-count'] as const,
};

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch alerts with optional filtering
 */
export function useAlerts(params?: AlertFilterParams) {
  return useQuery<Alert[]>({
    queryKey: alertKeys.list(params),
    queryFn: () => alertService.getAlerts(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch unread alert count
 * Returns the count directly as a number
 */
export function useUnreadAlertCount() {
  return useQuery<number>({
    queryKey: alertKeys.unreadCount(),
    queryFn: async () => {
      const response = await alertService.getUnreadCount();
      return response.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to mark an alert as read
 */
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alertService.markAsRead(id),
    onSuccess: (_, alertId) => {
      // Update the alert in cache
      queryClient.setQueriesData<Alert[]>({ queryKey: alertKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((alert) => (alert.id === alertId ? { ...alert, isRead: true, readAt: new Date().toISOString() } : alert));
      });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: alertKeys.unreadCount() });
    },
  });
}

/**
 * Hook to mark all alerts as read
 */
export function useMarkAllAlertsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertService.markAllAsRead(),
    onSuccess: () => {
      // Mark all alerts as read in cache
      queryClient.setQueriesData<Alert[]>({ queryKey: alertKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((alert) => ({ ...alert, isRead: true, readAt: new Date().toISOString() }));
      });
      // Reset unread count
      queryClient.setQueryData<number>(alertKeys.unreadCount(), 0);
    },
  });
}

/**
 * Hook to dismiss an alert
 */
export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alertService.dismissAlert(id),
    onSuccess: (_, alertId) => {
      // Remove the alert from cache
      queryClient.setQueriesData<Alert[]>({ queryKey: alertKeys.lists() }, (old) => {
        if (!old) return old;
        return old.filter((alert) => alert.id !== alertId);
      });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: alertKeys.unreadCount() });
    },
  });
}
