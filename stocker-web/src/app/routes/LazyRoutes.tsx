import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Loading component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

// Lazy load all heavy components
export const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ '@/features/master/pages/Dashboard')
    .then(module => ({ default: module.Dashboard || module.default }))
);

export const CRMDashboard = lazy(() => 
  import(/* webpackChunkName: "crm-dashboard" */ '@/features/crm/pages/CRMDashboard')
    .then(module => ({ default: module.CRMDashboard || module.default }))
);

export const CustomersPage = lazy(() => 
  import(/* webpackChunkName: "customers" */ '@/features/crm/pages/CustomersPage')
    .then(module => ({ default: module.CustomersPage || module.default }))
);

export const OpportunitiesPage = lazy(() => 
  import(/* webpackChunkName: "opportunities" */ '@/features/crm/pages/OpportunitiesPage')
    .then(module => ({ default: module.OpportunitiesPage || module.default }))
);

export const ActivitiesPage = lazy(() => 
  import(/* webpackChunkName: "activities" */ '@/features/crm/pages/ActivitiesPage')
    .then(module => ({ default: module.ActivitiesPage || module.default }))
);

export const PipelinePage = lazy(() => 
  import(/* webpackChunkName: "pipeline" */ '@/features/crm/pages/PipelinePage')
    .then(module => ({ default: module.PipelinePage || module.default }))
);

export const SalesPage = lazy(() => 
  import(/* webpackChunkName: "sales" */ '@/features/sales/pages/SalesPage')
    .then(module => ({ default: module.SalesPage || module.default }))
);

export const InventoryPage = lazy(() => 
  import(/* webpackChunkName: "inventory" */ '@/features/inventory/pages/InventoryPage')
    .then(module => ({ default: module.InventoryPage || module.default }))
);

export const ReportsPage = lazy(() => 
  import(/* webpackChunkName: "reports" */ '@/features/reports/pages/ReportsPage')
    .then(module => ({ default: module.ReportsPage || module.default }))
);

export const SettingsPage = lazy(() => 
  import(/* webpackChunkName: "settings" */ '@/features/settings/pages/SettingsPage')
    .then(module => ({ default: module.SettingsPage || module.default }))
);

export const ProfilePage = lazy(() => 
  import(/* webpackChunkName: "profile" */ '@/features/profile/pages/ProfilePage')
    .then(module => ({ default: module.ProfilePage || module.default }))
);

// Heavy feature modules - lazy load
export const ChartsModule = lazy(() => 
  import(/* webpackChunkName: "charts-module" */ '@ant-design/charts')
);

export const MonacoEditor = lazy(() => 
  import(/* webpackChunkName: "monaco-editor" */ '@monaco-editor/react')
);

export const DragAndDrop = lazy(() => 
  import(/* webpackChunkName: "dnd" */ 'react-beautiful-dnd')
);

// Utility function to wrap lazy components with Suspense
export const withSuspense = (Component: React.ComponentType) => {
  return (props: any) => (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

// Export pre-wrapped components for convenience
export const LazyDashboard = withSuspense(Dashboard);
export const LazyCRMDashboard = withSuspense(CRMDashboard);
export const LazyCustomersPage = withSuspense(CustomersPage);
export const LazyOpportunitiesPage = withSuspense(OpportunitiesPage);
export const LazyActivitiesPage = withSuspense(ActivitiesPage);
export const LazyPipelinePage = withSuspense(PipelinePage);
export const LazySalesPage = withSuspense(SalesPage);
export const LazyInventoryPage = withSuspense(InventoryPage);
export const LazyReportsPage = withSuspense(ReportsPage);
export const LazySettingsPage = withSuspense(SettingsPage);
export const LazyProfilePage = withSuspense(ProfilePage);