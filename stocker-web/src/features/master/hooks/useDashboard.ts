import { useQuery } from '@tanstack/react-query';
import { masterDashboardApi } from '@/shared/api/master.api';

// Query Keys
export const dashboardKeys = {
  all: ['master', 'dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  systemHealth: () => [...dashboardKeys.all, 'system-health'] as const,
  revenue: (period: string) => [...dashboardKeys.all, 'revenue', period] as const,
  events: () => [...dashboardKeys.all, 'events'] as const,
};

// Get dashboard statistics
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => masterDashboardApi.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Get system health metrics
export const useGetSystemHealth = () => {
  return useQuery({
    queryKey: dashboardKeys.systemHealth(),
    queryFn: () => masterDashboardApi.getSystemHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Get revenue chart data
export const useGetRevenueChart = (period: string = 'monthly') => {
  return useQuery({
    queryKey: dashboardKeys.revenue(period),
    queryFn: () => masterDashboardApi.getRevenueChart(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get recent system events
export const useGetRecentEvents = () => {
  return useQuery({
    queryKey: dashboardKeys.events(),
    queryFn: () => masterDashboardApi.getRecentEvents(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};