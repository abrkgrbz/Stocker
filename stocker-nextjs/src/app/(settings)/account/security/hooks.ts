import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, Setup2FAResponse, TwoFactorStatusResponse } from '@/lib/api/services/auth.service';
import { ApiService } from '@/lib/api';
import type { ApiResponse } from '@/lib/api/types';

// Types
export interface SecurityOverviewDto {
  twoFactorEnabled: boolean;
  passwordLastChanged: string | null;
  lastLoginDate: string | null;
  activeSessions: number;
  securityScore: number;
}

export interface ActiveSessionDto {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface SecurityEventDto {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export interface SecurityEventsResponse {
  items: SecurityEventDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query Keys
export const securityKeys = {
  all: ['security'] as const,
  twoFactorStatus: () => [...securityKeys.all, '2fa-status'] as const,
  overview: () => [...securityKeys.all, 'overview'] as const,
  sessions: () => [...securityKeys.all, 'sessions'] as const,
  events: (page: number) => [...securityKeys.all, 'events', page] as const,
};

// Get 2FA Status
export function use2FAStatus() {
  return useQuery({
    queryKey: securityKeys.twoFactorStatus(),
    queryFn: async () => {
      const response = await authService.get2FAStatus();
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Setup 2FA - Get QR Code and Secret
export function useSetup2FA() {
  return useMutation({
    mutationFn: async () => {
      const response = await authService.setup2FA();
      return response;
    },
  });
}

// Enable 2FA - Verify code and activate
export function useEnable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.enable2FA(code);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      // Also invalidate profile to update 2FA status there
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Disable 2FA
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.disable2FA(code);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      // Also invalidate profile to update 2FA status there
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Get Security Overview
export function useSecurityOverview() {
  return useQuery({
    queryKey: securityKeys.overview(),
    queryFn: async () => {
      const response = await ApiService.get<ApiResponse<SecurityOverviewDto>>('/api/account/security/overview');
      return response;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get Active Sessions
export function useActiveSessions() {
  return useQuery({
    queryKey: securityKeys.sessions(),
    queryFn: async () => {
      const response = await ApiService.get<ApiResponse<ActiveSessionDto[]>>('/api/account/security/sessions');
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get Security Events
export function useSecurityEvents(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: securityKeys.events(page),
    queryFn: async () => {
      const response = await ApiService.get<ApiResponse<SecurityEventsResponse>>(
        `/api/account/security/events?page=${page}&pageSize=${pageSize}`
      );
      return response;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Terminate Session
export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // TODO: Add terminate session endpoint when available
      const response = await ApiService.delete<ApiResponse<boolean>>(`/api/account/security/sessions/${sessionId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
    },
  });
}

// Terminate All Sessions
export function useTerminateAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // TODO: Add terminate all sessions endpoint when available
      const response = await ApiService.delete<ApiResponse<boolean>>('/api/account/security/sessions');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
    },
  });
}
