import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { CustomersPage } from './pages/CustomersPage';
import { LeadsPage } from './pages/LeadsPage';

const OpportunitiesPage = React.lazy(() => import('./pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const PipelinePage = React.lazy(() => import('./pages/PipelinePage').then(m => ({ default: m.PipelinePage })));
const ActivitiesPage = React.lazy(() => import('./pages/ActivitiesPage').then(m => ({ default: m.ActivitiesPage })));

export const CRMRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="customers" replace />} />
      <Route path="leads" element={<LeadsPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="opportunities" element={
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <OpportunitiesPage />
        </React.Suspense>
      } />
      <Route path="pipeline" element={
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <PipelinePage />
        </React.Suspense>
      } />
      <Route path="activities" element={
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <ActivitiesPage />
        </React.Suspense>
      } />
      <Route path="*" element={<Navigate to="customers" replace />} />
    </Routes>
  );
};