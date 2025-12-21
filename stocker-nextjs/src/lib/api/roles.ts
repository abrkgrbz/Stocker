/**
 * Role Management API Service
 * Handles CRUD operations for dynamic role management
 */

import { apiClient } from './client';

import logger from '../utils/logger';
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
  createdDate: string; // DateTime from backend
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

// Resource definition with module mapping
export interface ResourceDefinition {
  value: string;
  label: string;
  moduleCode?: string; // If null, it's a core/system resource available to all
  icon?: string;
}

// Module-based resource categories
export interface ModuleResourceCategory {
  moduleCode: string;
  moduleName: string;
  icon: string;
  color: string;
  resources: ResourceDefinition[];
}

// Core/System resources - available to all tenants
export const CORE_RESOURCES: ResourceDefinition[] = [
  { value: 'Users', label: 'Kullanıcılar', icon: '👥' },
  { value: 'Roles', label: 'Roller', icon: '🔐' },
  { value: 'Settings', label: 'Ayarlar', icon: '⚙️' },
  { value: 'Reports', label: 'Raporlar', icon: '📊' },
  { value: 'Security', label: 'Güvenlik', icon: '🛡️' },
  { value: 'Audit', label: 'Denetim', icon: '📋' },
];

// Module-specific resources
export const MODULE_RESOURCES: ModuleResourceCategory[] = [
  {
    moduleCode: 'INVENTORY',
    moduleName: 'Stok Yönetimi',
    icon: '📦',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    resources: [
      { value: 'Inventory.Products', label: 'Ürünler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Categories', label: 'Kategoriler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Warehouses', label: 'Depolar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockMovements', label: 'Stok Hareketleri', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Transfers', label: 'Transferler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Adjustments', label: 'Stok Düzeltmeleri', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Counts', label: 'Sayımlar', moduleCode: 'INVENTORY' },
    ],
  },
  {
    moduleCode: 'SALES',
    moduleName: 'Satış Yönetimi',
    icon: '💰',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    resources: [
      { value: 'Sales.Orders', label: 'Siparişler', moduleCode: 'SALES' },
      { value: 'Sales.Invoices', label: 'Faturalar', moduleCode: 'SALES' },
      { value: 'Sales.Quotations', label: 'Teklifler', moduleCode: 'SALES' },
      { value: 'Sales.Returns', label: 'İadeler', moduleCode: 'SALES' },
      { value: 'Sales.Payments', label: 'Ödemeler', moduleCode: 'SALES' },
      { value: 'Sales.PriceLists', label: 'Fiyat Listeleri', moduleCode: 'SALES' },
    ],
  },
  {
    moduleCode: 'PURCHASE',
    moduleName: 'Satınalma Yönetimi',
    icon: '🛒',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    resources: [
      { value: 'Purchase.Orders', label: 'Satınalma Siparişleri', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Invoices', label: 'Alış Faturaları', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Returns', label: 'Tedarikçi İadeleri', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Suppliers', label: 'Tedarikçiler', moduleCode: 'PURCHASE' },
    ],
  },
  {
    moduleCode: 'CRM',
    moduleName: 'Müşteri İlişkileri',
    icon: '💼',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    resources: [
      { value: 'CRM.Customers', label: 'Müşteriler', moduleCode: 'CRM' },
      { value: 'CRM.Leads', label: 'Potansiyel Müşteriler', moduleCode: 'CRM' },
      { value: 'CRM.Opportunities', label: 'Fırsatlar', moduleCode: 'CRM' },
      { value: 'CRM.Contacts', label: 'Kişiler', moduleCode: 'CRM' },
      { value: 'CRM.Activities', label: 'Aktiviteler', moduleCode: 'CRM' },
      { value: 'CRM.Pipelines', label: 'Satış Hattı', moduleCode: 'CRM' },
      { value: 'CRM.Campaigns', label: 'Kampanyalar', moduleCode: 'CRM' },
      { value: 'CRM.Segments', label: 'Segmentler', moduleCode: 'CRM' },
    ],
  },
  {
    moduleCode: 'HR',
    moduleName: 'İnsan Kaynakları',
    icon: '👔',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    resources: [
      { value: 'HR.Employees', label: 'Çalışanlar', moduleCode: 'HR' },
      { value: 'HR.Departments', label: 'Departmanlar', moduleCode: 'HR' },
      { value: 'HR.Positions', label: 'Pozisyonlar', moduleCode: 'HR' },
      { value: 'HR.Attendance', label: 'Devam Takibi', moduleCode: 'HR' },
      { value: 'HR.Leave', label: 'İzinler', moduleCode: 'HR' },
      { value: 'HR.Payroll', label: 'Bordro', moduleCode: 'HR' },
      { value: 'HR.Performance', label: 'Performans', moduleCode: 'HR' },
    ],
  },
  {
    moduleCode: 'FINANCE',
    moduleName: 'Finans Yönetimi',
    icon: '💳',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    resources: [
      { value: 'Finance.Accounts', label: 'Hesaplar', moduleCode: 'FINANCE' },
      { value: 'Finance.Transactions', label: 'İşlemler', moduleCode: 'FINANCE' },
      { value: 'Finance.Banks', label: 'Bankalar', moduleCode: 'FINANCE' },
      { value: 'Finance.CashFlow', label: 'Nakit Akışı', moduleCode: 'FINANCE' },
      { value: 'Finance.Budgets', label: 'Bütçeler', moduleCode: 'FINANCE' },
      { value: 'Finance.Taxes', label: 'Vergiler', moduleCode: 'FINANCE' },
    ],
  },
  {
    moduleCode: 'CMS',
    moduleName: 'İçerik Yönetimi',
    icon: '📝',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    resources: [
      { value: 'CMS.Pages', label: 'Sayfalar', moduleCode: 'CMS' },
      { value: 'CMS.Posts', label: 'Yazılar', moduleCode: 'CMS' },
      { value: 'CMS.Media', label: 'Medya', moduleCode: 'CMS' },
      { value: 'CMS.Menus', label: 'Menüler', moduleCode: 'CMS' },
    ],
  },
];

// Legacy flat list for backward compatibility
export const AVAILABLE_RESOURCES: ResourceDefinition[] = [
  ...CORE_RESOURCES,
  ...MODULE_RESOURCES.flatMap(m => m.resources),
];

/**
 * Get resources available to a tenant based on their active modules
 */
export function getAvailableResourcesForModules(activeModuleCodes: string[]): {
  coreResources: ResourceDefinition[];
  moduleResources: ModuleResourceCategory[];
} {
  const normalizedCodes = activeModuleCodes.map(c => c.toUpperCase());

  return {
    coreResources: CORE_RESOURCES,
    moduleResources: MODULE_RESOURCES.filter(m =>
      normalizedCodes.includes(m.moduleCode.toUpperCase())
    ),
  };
}

/**
 * Get all roles for current tenant
 */
export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<{ success: boolean; data: Role[]; message: string }>(
    '/tenant/roles'
  );
  // Backend returns: { success, data: Role[], message }
  // We need response.data.data (not response.data)
  return (response.data as any).data || [];
}

/**
 * Get a single role by ID
 */
export async function getRole(roleId: string): Promise<Role> {
  const response = await apiClient.get<{ success: boolean; data: Role; message: string }>(
    `/tenant/roles/${roleId}`
  );
  return (response.data as any).data as Role;
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
    '/tenant/roles',
    requestData
  );
  return (response.data as any).data as Role;
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

  await apiClient.put(`/tenant/roles/${roleId}`, requestData);
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/tenant/roles/${roleId}`);
}

/**
 * Parse permission string to Permission object
 * Format: "resource:permissionType" -> { resource, permissionType }
 * Handles both numeric (e.g., "Users:1") and string enum names (e.g., "Users:Create")
 */
export function parsePermission(permissionStr: string): Permission {
  const [resource, permissionTypeStr] = permissionStr.split(':');

  // Try to parse as number first
  const numericType = parseInt(permissionTypeStr, 10);

  // If it's a valid number, use it directly
  if (!isNaN(numericType)) {
    return {
      resource,
      permissionType: numericType,
    };
  }

  // Otherwise, it's a string enum name - convert to numeric value
  // Map string enum names to their numeric values
  const permissionTypeMap: Record<string, PermissionType> = {
    'View': PermissionType.View,
    'Create': PermissionType.Create,
    'Edit': PermissionType.Edit,
    'Delete': PermissionType.Delete,
    'Export': PermissionType.Export,
    'Import': PermissionType.Import,
    'Approve': PermissionType.Approve,
    'Execute': PermissionType.Execute,
  };

  const permissionType = permissionTypeMap[permissionTypeStr];

  if (permissionType === undefined) {
    logger.warn(`Unknown permission type: ${permissionTypeStr}`);
    return {
      resource,
      permissionType: 0, // Default to View
    };
  }

  return {
    resource,
    permissionType,
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
