import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/lib/api';

// Types
export interface ProfileData {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  departmentId?: string;
  department?: string;
  branchId?: string;
  branch?: string;
  profileImage?: string;
  createdDate?: string;
  lastLoginDate?: string;
  twoFactorEnabled: boolean;
  emailConfirmed: boolean;
  phoneConfirmed?: boolean;
  preferences?: {
    language: string;
    theme: string;
    notifications: boolean;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  branch?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  device?: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export interface ActivityLogResponse {
  items: ActivityLogItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query Keys
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  activityLog: (page: number = 1) => [...profileKeys.all, 'activity', page] as const,
};

// Get Profile
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const response = await ApiService.get<{
        success: boolean;
        data: ProfileData;
        message?: string;
      }>('/account/profile');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update Profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await ApiService.put<{
        success: boolean;
        data: boolean;
        message?: string;
      }>('/account/profile', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await ApiService.post<{
        success: boolean;
        data: boolean;
        message?: string;
      }>('/account/change-password', data);
      return response;
    },
  });
}

// Get Activity Log
export function useActivityLog(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: profileKeys.activityLog(page),
    queryFn: async () => {
      const response = await ApiService.get<{
        success: boolean;
        data: ActivityLogResponse;
        message?: string;
      }>(`/account/activity-log?page=${page}&pageSize=${pageSize}`);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Upload Profile Image
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await ApiService.post<{
        success: boolean;
        data: { imageUrl: string };
        message?: string;
      }>('/account/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Update Preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { language?: string; theme?: string; notifications?: boolean }) => {
      const response = await ApiService.put<{
        success: boolean;
        data: boolean;
        message?: string;
      }>('/account/preferences', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
