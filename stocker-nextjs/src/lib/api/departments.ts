/**
 * Department Management API Service
 * Handles CRUD operations for tenant departments
 */

import { apiClient } from './client';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  parentDepartmentId?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
}

/**
 * Get all departments for current tenant
 */
export async function getDepartments(): Promise<Department[]> {
  const response = await apiClient.get<{ success: boolean; data: Department[]; message: string }>(
    '/api/tenant/department'
  );
  return response.data;
}

/**
 * Create a new department
 */
export async function createDepartment(data: CreateDepartmentRequest): Promise<{ data: string; message: string }> {
  const response = await apiClient.post<{ success: boolean; data: string; message: string }>(
    '/api/tenant/department',
    data
  );
  return { data: response.data, message: response.message };
}

/**
 * Update department
 */
export async function updateDepartment(departmentId: string, data: UpdateDepartmentRequest): Promise<boolean> {
  const response = await apiClient.put<{ success: boolean; data: boolean; message: string }>(
    `/api/tenant/department/${departmentId}`,
    data
  );
  return response.data;
}

/**
 * Delete department
 */
export async function deleteDepartment(departmentId: string): Promise<boolean> {
  const response = await apiClient.delete<{ success: boolean; data: boolean; message: string }>(
    `/api/tenant/department/${departmentId}`
  );
  return response.data;
}
