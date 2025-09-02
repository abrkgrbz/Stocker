import React, { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

// Lazy load the main dashboard component
const MetronicDashboard = lazy(() => import('./MetronicDashboard'));

const LazyDashboard: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
          <div style={{ marginTop: '24px' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
          <div style={{ marginTop: '24px' }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      }
    >
      <MetronicDashboard />
    </Suspense>
  );
};

export default LazyDashboard;