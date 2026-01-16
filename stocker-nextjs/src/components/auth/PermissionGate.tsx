/**
 * Permission-based rendering components
 * Shows/hides content based on user permissions
 *
 * Permission format: "Resource:PermissionType"
 * Examples: "CRM.Customers:View", "Inventory.Products:Create", "HR.Employees:Edit"
 *
 * PermissionType values: View, Create, Edit, Delete, Export, Import, Approve, Execute
 */

'use client';

import { useAuth } from '@/lib/auth/auth-context';

interface PermissionGateProps {
  /**
   * Single permission string in format "Resource:PermissionType"
   * Example: "CRM.Customers:View"
   */
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on a single permission
 * @example
 * <PermissionGate permission="CRM.Customers:Create">
 *   <Button>Add Customer</Button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasAnyPermission } = useAuth();

  if (!hasAnyPermission([permission])) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyPermissionGateProps {
  /**
   * Array of permission strings - user needs ANY of these
   */
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if user has ANY of the specified permissions
 * @example
 * <AnyPermissionGate permissions={["CRM.Customers:Edit", "CRM.Customers:Delete"]}>
 *   <ActionButtons />
 * </AnyPermissionGate>
 */
export function AnyPermissionGate({ permissions, children, fallback = null }: AnyPermissionGateProps) {
  const { hasAnyPermission } = useAuth();

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AllPermissionsGateProps {
  /**
   * Array of permission strings - user needs ALL of these
   */
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if user has ALL of the specified permissions
 * @example
 * <AllPermissionsGate permissions={["CRM:View", "CRM.Customers:Edit"]}>
 *   <EditCustomerForm />
 * </AllPermissionsGate>
 */
export function AllPermissionsGate({ permissions, children, fallback = null }: AllPermissionsGateProps) {
  const { hasAnyPermission } = useAuth();

  // Check if user has all permissions
  const hasAll = permissions.every(p => hasAnyPermission([p]));

  if (!hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================
// Convenience components for CRUD operations
// ============================================

interface ResourcePermissionProps {
  /**
   * Resource name (e.g., "CRM.Customers", "Inventory.Products")
   */
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Show content only if user can view the resource
 * @example
 * <CanView resource="CRM.Customers">
 *   <CustomerList />
 * </CanView>
 */
export function CanView({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:View`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can create in the resource
 * @example
 * <CanCreate resource="CRM.Customers">
 *   <Button>Add Customer</Button>
 * </CanCreate>
 */
export function CanCreate({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Create`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can edit the resource
 * @example
 * <CanEdit resource="CRM.Customers">
 *   <Button>Edit Customer</Button>
 * </CanEdit>
 */
export function CanEdit({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Edit`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can delete from the resource
 * @example
 * <CanDelete resource="CRM.Customers">
 *   <Button danger>Delete Customer</Button>
 * </CanDelete>
 */
export function CanDelete({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Delete`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can export from the resource
 * @example
 * <CanExport resource="CRM.Customers">
 *   <Button>Export to Excel</Button>
 * </CanExport>
 */
export function CanExport({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Export`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can import to the resource
 * @example
 * <CanImport resource="Inventory.Products">
 *   <Button>Import from Excel</Button>
 * </CanImport>
 */
export function CanImport({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Import`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can approve in the resource
 * @example
 * <CanApprove resource="Purchase.Orders">
 *   <Button>Approve Order</Button>
 * </CanApprove>
 */
export function CanApprove({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Approve`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if user can execute in the resource
 * @example
 * <CanExecute resource="Manufacturing.ProductionOrders">
 *   <Button>Start Production</Button>
 * </CanExecute>
 */
export function CanExecute({ resource, children, fallback = null }: ResourcePermissionProps) {
  return (
    <PermissionGate permission={`${resource}:Execute`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

// ============================================
// Role-based convenience components (legacy support)
// ============================================

/**
 * Show content only for admin users (FirmaYoneticisi or SistemYoneticisi)
 */
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi');
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only for system admin (SistemYoneticisi)
 */
export function SystemAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user } = useAuth();
  const isSystemAdmin = user?.roles?.includes('SistemYoneticisi');
  return isSystemAdmin ? <>{children}</> : <>{fallback}</>;
}

// ============================================
// Hook for programmatic permission checks
// ============================================

/**
 * Hook for checking permissions programmatically
 * @example
 * const { canCreate, canEdit, canDelete } = useResourcePermissions('CRM.Customers');
 * if (canCreate) { ... }
 */
export function useResourcePermissions(resource: string) {
  const { hasPermission } = useAuth();

  return {
    canView: hasPermission(resource, 'View'),
    canCreate: hasPermission(resource, 'Create'),
    canEdit: hasPermission(resource, 'Edit'),
    canDelete: hasPermission(resource, 'Delete'),
    canExport: hasPermission(resource, 'Export'),
    canImport: hasPermission(resource, 'Import'),
    canApprove: hasPermission(resource, 'Approve'),
    canExecute: hasPermission(resource, 'Execute'),
  };
}
