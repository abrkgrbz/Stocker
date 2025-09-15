import React, { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
    setChecking(false);
  }, [checkAuth]);

  useEffect(() => {
    // Redirect logic based on auth status
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

    if (!checking) {
      if (!isAuthenticated && !isPublicPath) {
        // Not authenticated and trying to access protected route
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      } else if (isAuthenticated && location.pathname === '/login') {
        // Already authenticated and on login page
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate, checking, location.state]);

  // Show loading while checking auth
  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  return <>{children}</>;
};