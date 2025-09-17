import React from 'react';
import { useNavigate } from 'react-router-dom';

import { LockOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';

import { usePermissions, Permission } from '@/shared/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: Permission | Permission[];
  roles?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  roles,
  requireAll = false,
  fallback,
  showError = true,
}) => {
  const navigate = useNavigate();
  const { hasPermission, hasAllPermissions, hasRole } = usePermissions();

  const hasAccess = React.useMemo(() => {
    let permissionCheck = true;
    let roleCheck = true;

    if (permissions) {
      if (requireAll && Array.isArray(permissions)) {
        permissionCheck = hasAllPermissions(permissions);
      } else {
        permissionCheck = hasPermission(permissions);
      }
    }

    if (roles) {
      roleCheck = hasRole(roles);
    }

    return permissionCheck && roleCheck;
  }, [permissions, roles, requireAll, hasPermission, hasAllPermissions, hasRole]);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Üzgünüz, bu sayfaya erişim yetkiniz bulunmamaktadır."
          icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
          extra={[
            <Button type="primary" onClick={() => navigate(-1)} key="back">
              Geri Dön
            </Button>,
            <Button onClick={() => navigate('/')} key="home">
              Ana Sayfa
            </Button>,
          ]}
        />
      );
    }

    return null;
  }

  return <>{children}</>;
};

// HOC for protecting components
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions?: Permission | Permission[],
  roles?: string | string[]
) {
  return (props: P) => (
    <PermissionGuard permissions={permissions} roles={roles}>
      <Component {...props} />
    </PermissionGuard>
  );
}

// Hook for conditional rendering
export function usePermissionVisibility(
  permissions?: Permission | Permission[],
  roles?: string | string[]
): boolean {
  const { hasPermission, hasRole } = usePermissions();

  return React.useMemo(() => {
    let permissionCheck = true;
    let roleCheck = true;

    if (permissions) {
      permissionCheck = hasPermission(permissions);
    }

    if (roles) {
      roleCheck = hasRole(roles);
    }

    return permissionCheck && roleCheck;
  }, [permissions, roles, hasPermission, hasRole]);
}