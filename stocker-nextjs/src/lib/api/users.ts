/**
 * User Management API Service
 * Handles CRUD operations for tenant users
 */

import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  accessFailedCount: number;
  lastLoginDate?: string;
  lastPasswordChangeDate?: string;
  createdDate: string;
  modifiedDate?: string;
  department?: Department;
  branch?: Branch;
  roles: Role[];
  permissions: string[];
  settings: UserSettings;
  loginHistory: LoginHistory[];
}

export interface Department {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserSettings {
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface LoginHistory {
  date: string;
  ipAddress?: string;
  device?: string;
  status: string;
}

export interface UsersListDto {
  items: UserListItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  department?: string;
  branch?: string;
  lastLoginDate?: string;
  createdDate: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleIds?: string[]; // Multiple roles support
  department?: string;
  branch?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface ToggleUserStatusResult {
  userId: string;
  isActive: boolean;
  message: string;
}

/**
 * Get all users for current tenant with pagination
 */
export async function getUsers(
  page: number = 1,
  pageSize: number = 100,
  searchTerm?: string
): Promise<UsersListDto> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) {
    params.append('searchTerm', searchTerm);
  }

  const response = await apiClient.get<{ success: boolean; data: UsersListDto; message: string }>(
    `/api/tenant/users?${params.toString()}`
  );

  return (response.data as any).data || response.data;
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const response = await apiClient.get<{ success: boolean; data: User; message: string }>(
    `/api/tenant/users/${userId}`
  );
  return (response.data as any).data || response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<{ data: UserListItem; message: string }> {
  const response = await apiClient.post<{ success: boolean; data: UserListItem; message: string }>(
    '/api/tenant/users',
    data
  );
  return { data: (response.data as any).data || response.data, message: response.message || '' };
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<boolean> {
  const response = await apiClient.put<{ success: boolean; data: boolean; message: string }>(
    `/api/tenant/users/${userId}`,
    data
  );
  return (response.data as any).data || response.data || false;
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const response = await apiClient.delete<{ success: boolean; data: boolean; message: string }>(
    `/api/tenant/users/${userId}`
  );
  return (response.data as any).data || response.data || false;
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string): Promise<ToggleUserStatusResult> {
  const response = await apiClient.post<{ success: boolean; data: ToggleUserStatusResult; message: string }>(
    `/api/tenant/users/${userId}/toggle-status`
  );
  return (response.data as any).data || response.data;
}

/**
 * Get role name in Turkish
 */
export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    'FirmaYöneticisi': 'Admin',
    'Admin': 'Admin',
    'Yönetici': 'Yönetici',
    'Manager': 'Yönetici',
    'Kullanıcı': 'Kullanıcı',
    'User': 'Kullanıcı',
  };
  return roleLabels[role] || role;
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calculate days since date
 */
export function daysSince(dateString?: string): number {
  if (!dateString) return 0;

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
