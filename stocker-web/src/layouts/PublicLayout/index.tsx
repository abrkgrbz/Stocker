import React from 'react';
import { Outlet } from 'react-router-dom';
import './style.css';

export const PublicLayout: React.FC = () => {
  return <Outlet />;
};