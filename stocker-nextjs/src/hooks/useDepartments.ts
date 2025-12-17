/**
 * React Query hooks for department management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
  type CreateDepartmentRequest,
  type Department,
  type UpdateDepartmentRequest,
} from '@/lib/api/departments';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
} from '@/lib/utils/sweetalert';

export const DEPARTMENTS_QUERY_KEY = ['departments'];

/**
 * Fetch all departments
 */
export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: getDepartments,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch a single department by ID
 */
export function useDepartment(departmentId: string) {
  return useQuery<Department>({
    queryKey: [...DEPARTMENTS_QUERY_KEY, departmentId],
    queryFn: () => getDepartment(departmentId),
    enabled: !!departmentId,
  });
}

/**
 * Create new department mutation
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      showCreateSuccess('departman');
    },
    onError: (error: any) => {
      showError(error.message || 'Departman oluşturulurken bir hata oluştu');
    },
  });
}

/**
 * Update department mutation
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, data }: { departmentId: string; data: UpdateDepartmentRequest }) =>
      updateDepartment(departmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      showUpdateSuccess('departman');
    },
    onError: (error: any) => {
      showError(error.message || 'Departman güncellenirken bir hata oluştu');
    },
  });
}

/**
 * Delete department mutation
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) => deleteDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      showDeleteSuccess('departman');
    },
    onError: (error: any) => {
      showError(error.message || 'Departman silinirken bir hata oluştu');
    },
  });
}
