import React from 'react';
import { Outlet } from 'react-router-dom';

export const TenantLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Outlet />
    </div>
  );
};