/**
 * React Query hooks for role management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  type CreateRoleRequest,
  type Role,
  type UpdateRoleRequest,
} from '@/lib/api/roles';

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
 * Create new role mutation
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      message.success('Rol başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      message.error(error.message || 'Rol oluşturulurken bir hata oluştu');
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
      message.success('Rol başarıyla güncellendi');
    },
    onError: (error: any) => {
      message.error(error.message || 'Rol güncellenirken bir hata oluştu');
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
      message.success('Rol başarıyla silindi');
    },
    onError: (error: any) => {
      message.error(error.message || 'Rol silinirken bir hata oluştu');
    },
  });
}
