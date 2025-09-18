import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Spin } from 'antd';

import { useAuthStore } from '@/app/store/auth.store';

interface PrivateRouteProps {
  children?: React.ReactNode;
  roles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth if not already initialized
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Prevent redirect loop - if already on login page, don't redirect
    if (location.pathname === '/' || location.pathname === '/login') {
      return null;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0 && user) {
    const hasRequiredRole = user.roles && user.roles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Return children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};