/**
 * React Query hooks for role management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
  type CreateRoleRequest,
  type Role,
  type UpdateRoleRequest,
} from '@/lib/api/roles';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
} from '@/lib/utils/sweetalert';

export const ROLES_QUERY_KEY = ['roles'];

/**
 * Fetch all roles
 */
export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: getRoles,
  });
}

/**
 * Fetch a single role by ID
 */
export function useRole(roleId: string) {
  return useQuery<Role>({
    queryKey: [...ROLES_QUERY_KEY, roleId],
    queryFn: () => getRole(roleId),
    enabled: !!roleId,
  });
}

/**
 * Create new role mutation
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      showCreateSuccess('rol');
    },
    onError: (error: any) => {
      showError(error.message || 'Rol oluşturulurken bir hata oluştu');
    },
  });
}

/**
 * Update role mutation
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleRequest }) =>
      updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      showUpdateSuccess('rol');
    },
    onError: (error: any) => {
      showError(error.message || 'Rol güncellenirken bir hata oluştu');
    },
  });
}

/**
 * Delete role mutation
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      showDeleteSuccess('rol');
    },
    onError: (error: any) => {
      showError(error.message || 'Rol silinirken bir hata oluştu');
    },
  });
}
