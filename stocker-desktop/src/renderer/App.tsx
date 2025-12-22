import React from 'react';
import { App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginScreen } from './features/auth/LoginScreen';
import { SetupWizard } from './features/onboarding/SetupWizard';
import { InventoryDashboard } from './features/inventory/InventoryDashboard';
import { ProductList } from './features/inventory/ProductList';
import { ProductForm } from './features/inventory/ProductForm';
import { SalesDashboard } from './features/sales/SalesDashboard';
import { OrderList } from './features/sales/OrderList';
import { OrderForm } from './features/sales/OrderForm';
import { CrmDashboard } from './features/crm/CrmDashboard';
import { CustomerList } from './features/crm/CustomerList';
import { CustomerForm } from './features/crm/CustomerForm';
import { HrDashboard } from './features/hr/HrDashboard';
import { EmployeeList } from './features/hr/EmployeeList';
import { EmployeeForm } from './features/hr/EmployeeForm';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder components
const Dashboard = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">Online</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 font-medium text-sm">Total Revenue</h3>
        <p className="text-3xl font-bold text-slate-900 mt-2">₺124,500</p>
        <p className="text-emerald-600 text-sm mt-1">↑ 12.5% from last month</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 font-medium text-sm">Active Orders</h3>
        <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
        <p className="text-emerald-600 text-sm mt-1">↑ 2 new today</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 font-medium text-sm">Low Stock Items</h3>
        <p className="text-3xl font-bold text-slate-900 mt-2">5</p>
        <p className="text-amber-500 text-sm mt-1">Need attention</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 font-medium text-sm">Total Customers</h3>
        <p className="text-3xl font-bold text-slate-900 mt-2">1,204</p>
        <p className="text-slate-400 text-sm mt-1">Active database</p>
      </div>
    </div>

    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
      <h4 className="font-semibold text-slate-900 mb-2">Welcome to Stocker Desktop</h4>
      <p className="text-slate-500">
        Select a module from the sidebar to start working.
        This version is synced with your local database logic.
      </p>
    </div>
  </div>
);

const NotFound = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2">Page not found</p>
    </div>
  </div>
);

// Main Layout (to be migrated)


export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AntApp>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/setup" element={<SetupWizard />} />

              {/* Protected Routes */}
              <Route path="/" element={<Dashboard />} />

              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/products" element={<ProductList />} />
              <Route path="/inventory/products/new" element={<ProductForm />} />
              <Route path="/inventory/products/edit" element={<ProductForm />} />

              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/sales/orders" element={<OrderList />} />
              <Route path="/sales/orders/new" element={<OrderForm />} />

              <Route path="/crm" element={<CrmDashboard />} />
              <Route path="/crm/customers" element={<CustomerList />} />
              <Route path="/crm/customers/new" element={<CustomerForm />} />

              <Route path="/hr" element={<HrDashboard />} />
              <Route path="/hr/employees" element={<EmployeeList />} />
              <Route path="/hr/employees/new" element={<EmployeeForm />} />

              <Route path="/settings/*" element={<Dashboard />} />

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </AntApp>
    </QueryClientProvider>
  );
};

export default App;
