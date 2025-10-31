/**
 * Role Management API Service
 * Handles CRUD operations for dynamic role management
 */

import { apiClient } from './client';

export interface Permission {
  resource: string;
  permissionType: number;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Format: "resource:permissionType"
  userCount: number;
  isSystemRole: boolean;
  createdDate: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

export enum PermissionType {
  View = 0,
  Create = 1,
  Edit = 2,
  Delete = 3,
  Export = 4,
  Import = 5,
  Approve = 6,
  Execute = 7,
}

export const PERMISSION_TYPE_LABELS: Record<PermissionType, string> = {
  [PermissionType.View]: 'Görüntüleme',
  [PermissionType.Create]: 'Oluşturma',
  [PermissionType.Edit]: 'Düzenleme',
  [PermissionType.Delete]: 'Silme',
  [PermissionType.Export]: 'Dışa Aktarma',
  [PermissionType.Import]: 'İçe Aktarma',
  [PermissionType.Approve]: 'Onaylama',
  [PermissionType.Execute]: 'Yürütme',
};

// Common resources in the system
export const AVAILABLE_RESOURCES = [
  { value: 'Users', label: 'Kullanıcılar' },
  { value: 'Roles', label: 'Roller' },
  { value: 'Tenants', label: 'Tenant\'lar' },
  { value: 'Modules', label: 'Modüller' },
  { value: 'Settings', label: 'Ayarlar' },
  { value: 'Reports', label: 'Raporlar' },
  { value: 'Integrations', label: 'Entegrasyonlar' },
  { value: 'Billing', label: 'Faturalandırma' },
  { value: 'Security', label: 'Güvenlik' },
  { value: 'Audit', label: 'Denetim' },
  { value: 'CRM.Customers', label: 'CRM - Müşteriler' },
  { value: 'CRM.Leads', label: 'CRM - Potansiyel Müşteriler' },
  { value: 'CRM.Deals', label: 'CRM - Fırsatlar' },
  { value: 'CRM.Activities', label: 'CRM - Aktiviteler' },
  { value: 'CRM.Pipelines', label: 'CRM - Satış Hattı' },
  { value: 'CRM.Campaigns', label: 'CRM - Kampanyalar' },
];

/**
 * Get all roles for current tenant
 */
export async function getRoles(): Promise<Role[]> {
  console.log('🔍 Fetching roles from /api/tenant/roles...');
  const response = await apiClient.get<{ success: boolean; data: Role[]; message: string }>(
    '/api/tenant/roles'
  );
  console.log('📋 Roles API Response:', response);
  console.log('📊 Roles Data:', response.data);
  console.log('🎯 Extracted Roles:', response.data?.data);
  return response.data?.data || [];
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  // Convert Permission[] to DTO format expected by backend
  const requestData = {
    name: data.name,
    description: data.description,
    permissions: data.permissions.map((p) => ({
      resource: p.resource,
      permissionType: p.permissionType,
    })),
  };

  const response = await apiClient.post<{ success: boolean; data: Role; message: string }>(
    '/api/tenant/roles',
    requestData
  );
  return response.data?.data as Role;
}

/**
 * Update an existing role
 */
export async function updateRole(roleId: string, data: UpdateRoleRequest): Promise<void> {
  // Convert Permission[] to DTO format expected by backend
  const requestData = {
    name: data.name,
    description: data.description,
    permissions: data.permissions.map((p) => ({
      resource: p.resource,
      permissionType: p.permissionType,
    })),
  };

  await apiClient.put(`/api/tenant/roles/${roleId}`, requestData);
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/api/tenant/roles/${roleId}`);
}

/**
 * Parse permission string to Permission object
 * Format: "resource:permissionType" -> { resource, permissionType }
 */
export function parsePermission(permissionStr: string): Permission {
  const [resource, permissionType] = permissionStr.split(':');
  return {
    resource,
    permissionType: parseInt(permissionType, 10),
  };
}

/**
 * Format permission object to string
 * { resource, permissionType } -> "resource:permissionType"
 */
export function formatPermission(permission: Permission): string {
  return `${permission.resource}:${permission.permissionType}`;
}

/**
 * Get user-friendly permission label
 */
export function getPermissionLabel(permission: Permission): string {
  const resource = AVAILABLE_RESOURCES.find((r) => r.value === permission.resource);
  const resourceLabel = resource?.label || permission.resource;
  const typeLabel = PERMISSION_TYPE_LABELS[permission.permissionType as PermissionType];
  return `${resourceLabel} - ${typeLabel}`;
}

/**
 * Group permissions by resource
 */
export function groupPermissionsByResource(
  permissions: Permission[]
): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}
