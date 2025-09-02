import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { Spin } from 'antd';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  console.log('[PrivateRoute] Checking access:', {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    userRoles: user?.roles,
    requiredRoles: roles,
    user: user ? { id: user.id, email: user.email, roles: user.roles } : null
  });

  if (isLoading) {
    console.log('[PrivateRoute] Still loading...');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[PrivateRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.some(role => user.roles.includes(role))) {
    console.log('[PrivateRoute] User lacks required role:', {
      userRoles: user.roles,
      requiredRoles: roles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[PrivateRoute] Access granted');
  return <>{children}</>;
};