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

  if (isLoading) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.some(role => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};