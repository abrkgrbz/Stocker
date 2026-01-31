import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import TenantsPage from './pages/TenantsPage';
import TenantDetailPage from './pages/TenantDetailPage';
import ModulesPage from './pages/ModulesPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import SystemHub from './pages/SystemHub';
import RegistrationsPage from './pages/RegistrationsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import ModuleMarketPage from './pages/ModuleMarketPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SecretsPage from './pages/SecretsPage';
import StoragePage from './pages/StoragePage';
import ReportsPage from './pages/ReportsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import APIStatusPage from './pages/APIStatusPage';
import MigrationsPage from './pages/MigrationsPage';
import TenantMigrationDetailPage from './pages/TenantMigrationDetailPage';
import HangfirePage from './pages/HangfirePage';
import CreatePackagePage from './pages/CreatePackagePage';
import PackageDetailPage from './pages/PackageDetailPage';
import PricingConfigPage from './pages/PricingConfigPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { ThemeProvider } from './hooks/useTheme';
import { NavigatorPage } from './pages/NavigatorPage';
import CMSPage from './pages/CMSPage';
import HelpPage from './pages/HelpPage';
import { HelpLayout } from './layouts/HelpLayout';
import { CMSLayout } from './layouts/CMSLayout';
import PageListPage from './pages/cms/PageListPage';
import BlogListPage from './pages/cms/BlogListPage';
import DocsListPage from './pages/cms/DocsListPage';
import MediaLibraryPage from './pages/cms/MediaLibraryPage';
import CMSSettingsPage from './pages/cms/CMSSettingsPage';
import PageEditor from './pages/cms/PageEditor';
import BlogEditor from './pages/cms/BlogEditor';
import DocsEditor from './pages/cms/DocsEditor';
import TicketListPage from './pages/help/TicketListPage';
import TicketDetailPage from './pages/help/TicketDetailPage';
import KnowledgeBasePage from './pages/help/KnowledgeBasePage';
import CustomerListPage from './pages/help/CustomerListPage';
import CustomerProfilePage from './pages/help/CustomerProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Navigator - Landing Page */}
            <Route path="/" element={<AuthGuard><NavigatorPage /></AuthGuard>} />

            {/* Sub-Systems Placeholders */}
            <Route path="/cms" element={<AuthGuard><CMSLayout><CMSPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/pages" element={<AuthGuard><CMSLayout><PageListPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/blog" element={<AuthGuard><CMSLayout><BlogListPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/docs" element={<AuthGuard><CMSLayout><DocsListPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/media" element={<AuthGuard><CMSLayout><MediaLibraryPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/settings" element={<AuthGuard><CMSLayout><CMSSettingsPage /></CMSLayout></AuthGuard>} />
            <Route path="/cms/pages/new" element={<AuthGuard><CMSLayout><PageEditor /></CMSLayout></AuthGuard>} />
            <Route path="/cms/pages/:id" element={<AuthGuard><CMSLayout><PageEditor /></CMSLayout></AuthGuard>} />
            <Route path="/cms/blog/new" element={<AuthGuard><CMSLayout><BlogEditor /></CMSLayout></AuthGuard>} />
            <Route path="/cms/blog/:id" element={<AuthGuard><CMSLayout><BlogEditor /></CMSLayout></AuthGuard>} />
            <Route path="/cms/docs/new" element={<AuthGuard><CMSLayout><DocsEditor /></CMSLayout></AuthGuard>} />
            <Route path="/cms/docs/:id" element={<AuthGuard><CMSLayout><DocsEditor /></CMSLayout></AuthGuard>} />

            {/* Help Center */}
            <Route path="/help" element={<AuthGuard><HelpLayout><HelpPage /></HelpLayout></AuthGuard>} />
            <Route path="/help/tickets" element={<AuthGuard><HelpLayout><TicketListPage /></HelpLayout></AuthGuard>} />
            <Route path="/help/tickets/:id" element={<AuthGuard><HelpLayout><TicketDetailPage /></HelpLayout></AuthGuard>} />
            <Route path="/help/kb" element={<AuthGuard><HelpLayout><KnowledgeBasePage /></HelpLayout></AuthGuard>} />
            <Route path="/help/customers" element={<AuthGuard><HelpLayout><CustomerListPage /></HelpLayout></AuthGuard>} />
            <Route path="/help/customers/:id" element={<AuthGuard><HelpLayout><CustomerProfilePage /></HelpLayout></AuthGuard>} />
            {/* Additional Help pages can be added here */}

            {/* Master Admin Dashboard */}
            <Route path="/dashboard" element={<AuthGuard><MainLayout><Dashboard /></MainLayout></AuthGuard>} />

            {/* Tenant Management */}
            <Route path="/tenants" element={<AuthGuard><MainLayout><TenantsPage /></MainLayout></AuthGuard>} />
            <Route path="/tenants/:id" element={<AuthGuard><MainLayout><TenantDetailPage /></MainLayout></AuthGuard>} />
            <Route path="/tenants/registrations" element={<AuthGuard><MainLayout><RegistrationsPage /></MainLayout></AuthGuard>} />
            <Route path="/tenants/subscriptions" element={<AuthGuard><MainLayout><SubscriptionsPage /></MainLayout></AuthGuard>} />
            <Route path="/tenants/modules" element={<AuthGuard><MainLayout><ModulesPage /></MainLayout></AuthGuard>} />

            {/* Billing */}
            <Route path="/billing" element={<AuthGuard><MainLayout><BillingPage /></MainLayout></AuthGuard>} />
            <Route path="/billing/pricing" element={<AuthGuard><MainLayout><PricingConfigPage /></MainLayout></AuthGuard>} />
            <Route path="/billing/packages/new" element={<AuthGuard><MainLayout><CreatePackagePage /></MainLayout></AuthGuard>} />
            <Route path="/billing/packages/:id" element={<AuthGuard><MainLayout><PackageDetailPage /></MainLayout></AuthGuard>} />

            {/* System Operations */}
            <Route path="/system" element={<AuthGuard><MainLayout><SystemHub /></MainLayout></AuthGuard>} />
            <Route path="/system/audit-logs" element={<AuthGuard><MainLayout><AuditLogsPage /></MainLayout></AuthGuard>} />
            <Route path="/system/secrets" element={<AuthGuard><MainLayout><SecretsPage /></MainLayout></AuthGuard>} />
            <Route path="/system/storage" element={<AuthGuard><MainLayout><StoragePage /></MainLayout></AuthGuard>} />
            <Route path="/system/migrations" element={<AuthGuard><MainLayout><MigrationsPage /></MainLayout></AuthGuard>} />
            <Route path="/system/migrations/:tenantId" element={<AuthGuard><MainLayout><TenantMigrationDetailPage /></MainLayout></AuthGuard>} />
            <Route path="/system/api-status" element={<AuthGuard><MainLayout><APIStatusPage /></MainLayout></AuthGuard>} />
            <Route path="/system/hangfire" element={<AuthGuard><MainLayout><HangfirePage /></MainLayout></AuthGuard>} />

            {/* Master Tools */}
            <Route path="/modules" element={<AuthGuard><MainLayout><ModuleMarketPage /></MainLayout></AuthGuard>} />
            <Route path="/emails" element={<AuthGuard><MainLayout><EmailTemplatesPage /></MainLayout></AuthGuard>} />

            {/* Intelligence Tier */}
            <Route path="/analytics" element={<AuthGuard><MainLayout><AnalyticsPage /></MainLayout></AuthGuard>} />
            <Route path="/analytics/reports" element={<AuthGuard><MainLayout><ReportsPage /></MainLayout></AuthGuard>} />

            {/* Settings */}
            <Route path="/settings" element={<AuthGuard><MainLayout><SettingsPage /></MainLayout></AuthGuard>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
