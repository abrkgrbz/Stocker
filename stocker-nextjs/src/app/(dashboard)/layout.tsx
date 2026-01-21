'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Dropdown, Button, Tooltip, Popover, Badge, Drawer } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  InboxIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Search, HelpCircle, Plus, ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import { SignalRProvider } from '@/lib/signalr/signalr-context';
import { NotificationCenter } from '@/features/notifications/components';
import { ChatBadge } from '@/features/chat';
import { useNotificationHub } from '@/lib/signalr/notification-hub';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useOnboarding, type OnboardingFormData } from '@/lib/hooks/use-onboarding';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { message } from 'antd';
import GlobalSearch from '@/components/common/GlobalSearch';
import { MODULE_MENUS, getCurrentModule, type ModuleKey, type MenuItem } from '@/config/module-menus';
import logger from '@/lib/utils/logger';

/**
 * Filter menu items based on user permissions
 * @param items Menu items to filter
 * @param hasPermissionFn Function to check if user has a specific permission
 * @returns Filtered menu items
 */
function filterMenuItemsByPermission(
  items: MenuItem[],
  hasPermissionFn: (permission: string) => boolean
): MenuItem[] {
  return items
    .filter(item => {
      // If no permission specified, always show
      if (!item.permission) return true;
      // Check if user has the required permission
      return hasPermissionFn(item.permission);
    })
    .map(item => {
      // If item has children, recursively filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItemsByPermission(item.children, hasPermissionFn);
        // Only include parent if it has visible children
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }
      return item;
    })
    .filter((item): item is MenuItem => item !== null);
}

const { Header, Sider, Content } = Layout;

function DashboardContent({ children }: { children: React.ReactNode }) {
  // Check for auth bypass in development
  const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

  const { user, isAuthenticated, isLoading: authLoading, logout, hasAnyPermission } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [moduleSwitcherOpen, setModuleSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch active modules for the user
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  // Create a Set of active module codes for fast lookup
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Initialize SignalR notification hub
  useNotificationHub();

  // Check onboarding status
  const {
    wizardData,
    requiresOnboarding,
    loading: onboardingLoading,
    completeOnboarding
  } = useOnboarding();

  const handleOnboardingComplete = async (data: OnboardingFormData): Promise<{ tenantId?: string; success?: boolean }> => {
    try {
      logger.debug('Onboarding data being sent', { component: 'DashboardLayout', metadata: { data } });
      const result = await completeOnboarding(data);
      logger.info('Onboarding complete', {
        component: 'DashboardLayout',
        metadata: {
          provisioningStarted: result.provisioningStarted,
          tenantId: result.tenantId
        }
      });

      // Return tenantId for progress tracking if provisioning started
      const returnValue = {
        tenantId: result.provisioningStarted ? result.tenantId : undefined,
        success: true
      };
      return returnValue;
    } catch (error) {
      logger.error('Onboarding error', error instanceof Error ? error : new Error(String(error)), { component: 'DashboardLayout' });
      message.error('Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  useEffect(() => {
    // Skip redirect if auth bypassed
    if (isAuthBypassed) return;

    if (!authLoading && !isAuthenticated) {
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router, isAuthBypassed]);

  // Get current module based on pathname
  const currentModule = useMemo(() => getCurrentModule(pathname), [pathname]);
  const moduleConfig = currentModule ? MODULE_MENUS[currentModule] : null;

  // Filter menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    if (!moduleConfig) return [];

    // Create a permission checker function that handles permission string format
    const checkPermission = (permission: string) => {
      return hasAnyPermission([permission]);
    };

    return filterMenuItemsByPermission(moduleConfig.items, checkPermission);
  }, [moduleConfig, hasAnyPermission]);

  // Hide sidebar for modules page (it's a hub page, doesn't need sidebar)
  const hideSidebar = currentModule === 'modules' || pathname === '/app';

  // Get selected keys for menu
  const getSelectedKeys = useMemo(() => {
    // For nested routes, match to parent
    const routeMappings: Record<string, string> = {
      '/inventory/products': '/inventory/products',
      '/inventory/product-variants': '/inventory/product-variants',
      '/inventory/product-bundles': '/inventory/product-bundles',
      '/inventory/product-attributes': '/inventory/product-attributes',
      '/inventory/warehouses': '/inventory/warehouses',
      '/inventory/stock-movements': '/inventory/stock-movements',
      '/inventory/stock-transfers': '/inventory/stock-transfers',
      '/inventory/stock-counts': '/inventory/stock-counts',
      '/inventory/stock-adjustments': '/inventory/stock-adjustments',
      '/inventory/lot-batches': '/inventory/lot-batches',
      '/inventory/serial-numbers': '/inventory/serial-numbers',
      '/inventory/stock-reservations': '/inventory/stock-reservations',
      '/inventory/stock-alerts': '/inventory/stock-alerts',
      '/inventory/reports': '/inventory/reports',
      '/inventory/barcodes': '/inventory/barcodes',
      '/inventory/audit-trail': '/inventory/audit-trail',
      '/inventory/forecasting': '/inventory/forecasting',
      '/inventory/costing': '/inventory/costing',
      '/inventory/stock': '/inventory/stock',
      '/inventory/analytics': '/inventory/analytics',
      '/inventory/analysis': '/inventory/analysis',
      '/inventory/categories': '/inventory/categories',
      '/inventory/brands': '/inventory/brands',
      '/inventory/units': '/inventory/units',
      '/inventory/suppliers': '/inventory/suppliers',
      '/inventory/locations': '/inventory/locations',
      '/inventory/price-lists': '/inventory/price-lists',
      '/inventory/warehouse-zones': '/inventory/warehouse-zones',
      '/inventory/barcode-definitions': '/inventory/barcode-definitions',
      '/inventory/packaging-types': '/inventory/packaging-types',
      '/inventory/reorder-rules': '/inventory/reorder-rules',
      '/inventory/shelf-life': '/inventory/shelf-life',
      '/inventory/quality-control': '/inventory/quality-control',
      '/inventory/cycle-counts': '/inventory/cycle-counts',
      '/inventory/consignment-stocks': '/inventory/consignment-stocks',
      '/sales/orders': '/sales/orders',
      '/sales/invoices': '/sales/invoices',
      '/sales/e-invoices': '/sales/e-invoices',
      '/sales/payments': '/sales/payments',
      '/sales/customers': '/sales/customers',
      '/sales/quotations': '/sales/quotations',
      '/sales/returns': '/sales/returns',
      '/sales/commissions': '/sales/commissions',
      '/sales/discounts': '/sales/discounts',
      '/sales/contracts': '/sales/contracts',
      '/sales/territories': '/sales/territories',
      '/sales/shipments': '/sales/shipments',
      '/sales/segments': '/sales/segments',
      '/sales/pricelists': '/sales/pricelists',
      '/sales/targets': '/sales/targets',
      '/sales/reservations': '/sales/reservations',
      '/sales/backorders': '/sales/backorders',
      '/sales/delivery-notes': '/sales/delivery-notes',
      '/sales/advance-payments': '/sales/advance-payments',
      '/sales/credit-notes': '/sales/credit-notes',
      '/sales/service': '/sales/service',
      '/sales/warranty': '/sales/warranty',
      // HR Module
      '/hr/employees': '/hr/employees',
      '/hr/departments': '/hr/departments',
      '/hr/positions': '/hr/positions',
      '/hr/attendance': '/hr/attendance',
      '/hr/leaves': '/hr/leaves',
      '/hr/leave-types': '/hr/leave-types',
      '/hr/holidays': '/hr/holidays',
      '/hr/payroll': '/hr/payroll',
      '/hr/payslips': '/hr/payslips',
      '/hr/expenses': '/hr/expenses',
      '/hr/performance': '/hr/performance',
      '/hr/goals': '/hr/goals',
      '/hr/trainings': '/hr/trainings',
      '/hr/documents': '/hr/documents',
      '/hr/announcements': '/hr/announcements',
      '/hr/shifts': '/hr/shifts',
      '/hr/work-schedules': '/hr/work-schedules',
      '/hr/work-locations': '/hr/work-locations',
      '/hr/job-postings': '/hr/job-postings',
      '/hr/certifications': '/hr/certifications',
      '/hr/overtimes': '/hr/overtimes',
      // HR Module - New Entities
      '/hr/career-paths': '/hr/career-paths',
      '/hr/disciplinary-actions': '/hr/disciplinary-actions',
      '/hr/employee-assets': '/hr/employee-assets',
      '/hr/employee-benefits': '/hr/employee-benefits',
      '/hr/employee-skills': '/hr/employee-skills',
      '/hr/grievances': '/hr/grievances',
      '/hr/interviews': '/hr/interviews',
      '/hr/job-applications': '/hr/job-applications',
      '/hr/onboardings': '/hr/onboardings',
      '/hr/succession-plans': '/hr/succession-plans',
      '/hr/time-sheets': '/hr/time-sheets',
      // CRM Module
      '/crm/customers': '/crm/customers',
      '/crm/leads': '/crm/leads',
      '/crm/segments': '/crm/segments',
      '/crm/referrals': '/crm/referrals',
      '/crm/opportunities': '/crm/opportunities',
      '/crm/deals': '/crm/deals',
      '/crm/pipelines': '/crm/pipelines',
      '/crm/sales-teams': '/crm/sales-teams',
      '/crm/territories': '/crm/territories',
      '/crm/competitors': '/crm/competitors',
      '/crm/activities': '/crm/activities',
      '/crm/meetings': '/crm/meetings',
      '/crm/call-logs': '/crm/call-logs',
      '/crm/campaigns': '/crm/campaigns',
      '/crm/loyalty-programs': '/crm/loyalty-programs',
      '/crm/documents': '/crm/documents',
      '/crm/workflows': '/crm/workflows',
      // Purchase Module
      '/purchase/suppliers': '/purchase/suppliers',
      '/purchase/evaluations': '/purchase/evaluations',
      '/purchase/requests': '/purchase/requests',
      '/purchase/quotations': '/purchase/quotations',
      '/purchase/orders': '/purchase/orders',
      '/purchase/goods-receipts': '/purchase/goods-receipts',
      '/purchase/invoices': '/purchase/invoices',
      '/purchase/payments': '/purchase/payments',
      '/purchase/budgets': '/purchase/budgets',
      '/purchase/price-lists': '/purchase/price-lists',
      '/purchase/returns': '/purchase/returns',
      '/purchase/reports': '/purchase/reports',
      // Finance Module
      '/finance/invoices': '/finance/invoices',
      '/finance/current-accounts': '/finance/current-accounts',
      '/finance/current-account-transactions': '/finance/current-account-transactions',
      '/finance/bank-accounts': '/finance/bank-accounts',
      '/finance/bank-transactions': '/finance/bank-transactions',
      '/finance/cash-accounts': '/finance/cash-accounts',
      '/finance/cash-transactions': '/finance/cash-transactions',
      '/finance/payments': '/finance/payments',
      '/finance/collections': '/finance/collections',
      '/finance/payment-plans': '/finance/payment-plans',
      '/finance/checks': '/finance/checks',
      '/finance/promissory-notes': '/finance/promissory-notes',
      '/finance/expenses': '/finance/expenses',
      '/finance/expense-categories': '/finance/expense-categories',
      '/finance/cost-centers': '/finance/cost-centers',
      '/finance/currencies': '/finance/currencies',
      '/finance/exchange-rates': '/finance/exchange-rates',
      '/finance/fixed-assets': '/finance/fixed-assets',
      '/finance/depreciation': '/finance/depreciation',
      '/finance/budgets': '/finance/budgets',
      '/finance/budget-items': '/finance/budget-items',
      '/finance/chart-of-accounts': '/finance/chart-of-accounts',
      '/finance/journal-entries': '/finance/journal-entries',
      '/finance/accounting-periods': '/finance/accounting-periods',
      '/finance/tax-rates': '/finance/tax-rates',
      '/finance/withholding-taxes': '/finance/withholding-taxes',
      '/finance/reports': '/finance/reports',
      '/finance/aging-reports': '/finance/aging-reports',
      '/finance/cash-flow': '/finance/cash-flow',
    };

    for (const [prefix, key] of Object.entries(routeMappings)) {
      if (pathname.startsWith(prefix)) return [key];
    }

    return [pathname];
  }, [pathname]);

  // Skip loading checks if auth bypassed
  if (!isAuthBypassed && (authLoading || tenantLoading || onboardingLoading || modulesLoading)) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthBypassed && !isAuthenticated) {
    return null;
  }

  // Block access to dashboard if onboarding is not completed (skip if bypassed)
  if (!isAuthBypassed && requiresOnboarding) {
    return (
      <div className="flex items-center justify-center bg-gray-50" style={{ minHeight: '100dvh' }}>
        <OnboardingModal
          visible={true}
          wizardData={wizardData || { currentStepIndex: 0, totalSteps: 4, progressPercentage: 0 }}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  // Check module access - block access to modules user doesn't have
  const modulePathPrefixes: Record<string, string> = {
    '/crm': 'crm',
    '/hr': 'hr',
    '/inventory': 'inventory',
    '/sales': 'sales',
    '/purchase': 'purchase',
    '/finance': 'finance',
    '/manufacturing': 'manufacturing',
  };

  // Paths that are always allowed (no module required)
  const alwaysAllowedPaths = ['/dashboard', '/settings', '/modules', '/profile', '/notifications', '/reminders', '/chat', '/app'];
  const isAlwaysAllowed = alwaysAllowedPaths.some(path => pathname.startsWith(path));

  if (!isAlwaysAllowed) {
    // Check if current path requires a specific module
    for (const [prefix, moduleCode] of Object.entries(modulePathPrefixes)) {
      if (pathname.startsWith(prefix)) {
        // User is trying to access a module path - check if they have access
        const hasAccess = activeModuleCodes.has(moduleCode);
        if (!hasAccess) {
          // Redirect to /app with a message
          return (
            <div className="flex items-center justify-center bg-gray-50" style={{ minHeight: '100dvh' }}>
              <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                <ExclamationCircleIcon className="w-12 h-12 mx-auto text-amber-500" />
                <h2 className="text-xl font-semibold mt-4 mb-2">Erişim Yetkiniz Yok</h2>
                <p className="text-gray-500 mb-4">
                  Bu modüle erişim için aboneliğinizi yükseltmeniz gerekmektedir.
                </p>
                <Button type="primary" onClick={() => router.push('/app')} style={{ background: '#1a1a1a' }}>
                  Ana Sayfaya Dön
                </Button>
              </div>
            </div>
          );
        }
        break;
      }
    }
  }

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleBackToApp = () => {
    router.push('/app');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserIcon className="w-4 h-4" />, label: 'Profil' },
    { key: 'logout', icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />, label: 'Çıkış Yap', danger: true },
  ];

  const handleUserMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      router.push('/account/profile');
    }
  };

  // Sidebar content - shared between desktop and mobile
  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Module Header - Fixed */}
      <div
        style={{
          height: 64,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Modüllere Dön">
          <Button
            type="text"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => {
              handleBackToApp();
              setMobileMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
        {moduleConfig && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${moduleConfig.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: moduleConfig.color,
                fontSize: 16,
              }}
            >
              {moduleConfig.icon}
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>
              {moduleConfig.title}
            </span>
          </div>
        )}
      </div>

      {/* Module Menu - Scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}
      >
        {moduleConfig && filteredMenuItems.length > 0 && (
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys}
            items={filteredMenuItems as any}
            onClick={({ key }) => {
              handleMenuClick(key);
              setMobileMenuOpen(false);
            }}
            style={{ borderRight: 0, paddingTop: 8, paddingBottom: 8 }}
          />
        )}
      </div>

      {/* Quick Module Switch - Fixed Bottom */}
      <div
        style={{
          padding: 16,
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 11, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Hızlı Geçiş
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(MODULE_MENUS)
            .filter(([key]) => key !== currentModule && key !== 'modules')
            .slice(0, 4)
            .map(([key, config]) => (
              <Tooltip key={key} title={config.title}>
                <Button
                  type="text"
                  size="small"
                  icon={config.icon}
                  onClick={() => {
                    router.push(config.items[0]?.key || `/${key}`);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    color: config.color,
                    background: `${config.color}10`,
                    border: 'none',
                  }}
                />
              </Tooltip>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <Layout style={{ minHeight: '100dvh' }}>
        {/* Desktop Sidebar - Hidden on mobile and on hub pages (modules, app) */}
        {!hideSidebar && (
          <Sider
            theme="light"
            width={240}
            style={{
              height: '100dvh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              borderRight: '1px solid #f0f0f0',
              zIndex: 100,
              transition: 'transform 0.2s ease-in-out',
            }}
            className="dashboard-sider hidden lg:block"
          >
            {sidebarContent}
          </Sider>
        )}

        {/* Mobile Sidebar Drawer - Hidden on hub pages */}
        {!hideSidebar && (
          <Drawer
            placement="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            width={280}
            styles={{
              body: { padding: 0 },
              header: { display: 'none' },
            }}
            className="lg:hidden"
          >
            {sidebarContent}
          </Drawer>
        )}

        <Layout className={hideSidebar ? 'ml-0' : 'lg:ml-[240px] ml-0'}>
          <Header
            style={{
              padding: '0 12px',
              background: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              height: 56,
            }}
            className="sm:px-5"
          >
            {/* Left: Mobile Menu + Tenant Name + Module Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="sm:gap-3">
              {/* Mobile Menu Button - Only visible on mobile, hidden on hub pages */}
              {!hideSidebar && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MenuIcon className="w-5 h-5" strokeWidth={2} />
                </button>
              )}

              {/* Back to App button - Only visible on hub pages like /modules */}
              {hideSidebar && pathname !== '/app' && (
                <Tooltip title="Ana Sayfaya Dön">
                  <Button
                    type="text"
                    icon={<ArrowLeftIcon className="w-4 h-4" />}
                    onClick={() => router.push('/app')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Tooltip>
              )}

              <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }} className="hidden sm:block">
                {tenant?.name || 'Stocker'}
              </div>

              {/* Divider - Hidden on mobile */}
              <div style={{ width: 1, height: 20, background: '#e2e8f0' }} className="hidden sm:block" />

              {/* Module Switcher Button */}
              <Popover
                open={moduleSwitcherOpen}
                onOpenChange={setModuleSwitcherOpen}
                trigger="click"
                placement="bottomLeft"
                arrow={false}
                content={
                  <div style={{ width: 320, padding: 8 }}>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                    }}>
                      Modüller
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(MODULE_MENUS)
                        .filter(([key]) => key !== 'modules' && key !== 'communication')
                        .map(([key, config]) => {
                          const isActive = config.moduleCode === null || activeModuleCodes.has(config.moduleCode?.toLowerCase() || '');
                          const isCurrent = currentModule === key;

                          return (
                            <div
                              key={key}
                              onClick={() => {
                                if (isActive) {
                                  router.push(config.items[0]?.key || `/${key}`);
                                  setModuleSwitcherOpen(false);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 8,
                                cursor: isActive ? 'pointer' : 'not-allowed',
                                opacity: isActive ? 1 : 0.5,
                                background: isCurrent ? `${config.color}15` : 'transparent',
                                border: isCurrent ? `1px solid ${config.color}30` : '1px solid transparent',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (isActive && !isCurrent) {
                                  e.currentTarget.style.background = '#f5f5f5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrent) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: `${config.color}15`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: config.color,
                                  fontSize: 18,
                                }}
                              >
                                {config.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontWeight: 600,
                                  fontSize: 14,
                                  color: isCurrent ? config.color : '#333',
                                }}>
                                  {config.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                  {config.description}
                                </div>
                              </div>
                              {isCurrent && (
                                <Badge color={config.color} />
                              )}
                              {!isActive && (
                                <span style={{
                                  fontSize: 10,
                                  color: '#999',
                                  background: '#f0f0f0',
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}>
                                  Pasif
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    <div style={{
                      borderTop: '1px solid #f0f0f0',
                      marginTop: 12,
                      paddingTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          router.push('/app');
                          setModuleSwitcherOpen(false);
                        }}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Tüm Modüller
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          router.push('/modules');
                          setModuleSwitcherOpen(false);
                        }}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Modül Yönetimi
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button
                  type="text"
                  icon={<Squares2X2Icon className="w-4 h-4" />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#666',
                    fontWeight: 500,
                  }}
                >
                  Modüller
                </Button>
              </Popover>
            </div>

            {/* Center: Global Search Bar - Hidden on very small screens, icon on mobile */}
            <div className="flex-1 flex justify-center px-2 sm:px-4 lg:px-8">
              {/* Desktop Search Bar */}
              <button
                type="button"
                className="
                  hidden sm:flex
                  w-full max-w-md h-9 px-3 items-center gap-2
                  bg-slate-100 hover:bg-slate-200/80
                  border border-transparent hover:border-slate-300
                  rounded-lg transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1
                  group
                "
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-500" strokeWidth={2} />
                <span className="flex-1 text-left text-sm text-slate-400 group-hover:text-slate-500">
                  Ara...
                </span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
                  ⌘K
                </kbd>
              </button>
              {/* Mobile Search Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Help Button - Hidden on mobile */}
              <Tooltip title="Yardım & Destek">
                <button
                  type="button"
                  className="
                    hidden sm:flex
                    w-8 h-8 items-center justify-center
                    text-slate-400 hover:text-slate-600
                    border border-slate-200 hover:border-slate-300 hover:bg-slate-50
                    rounded-full transition-all duration-150
                  "
                  onClick={() => router.push('/help')}
                >
                  <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </Tooltip>

              {/* Notifications */}
              <NotificationCenter />

              {/* Chat Messages */}
              <ChatBadge />

              {/* Divider - Hidden on mobile */}
              <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1 sm:mx-2" />

              {/* Quick Create Button */}
              <Popover
                open={quickCreateOpen}
                onOpenChange={setQuickCreateOpen}
                trigger="click"
                placement="bottomRight"
                arrow={false}
                content={
                  <div style={{ width: 280, padding: 8 }}>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                    }}>
                      Hızlı Oluştur
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* CRM Items */}
                      {activeModuleCodes.has('crm') && (
                        <>
                          <div
                            onClick={() => { router.push('/crm/customers/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <UsersIcon className="w-4 h-4" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Müşteri</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/crm/leads/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <UserPlusIcon className="w-4 h-4" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Potansiyel</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/crm/opportunities/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <ArrowTrendingUpIcon className="w-4 h-4" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Fırsat</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Inventory Items */}
                      {activeModuleCodes.has('inventory') && (
                        <div
                          onClick={() => { router.push('/inventory/products/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#10b98115',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            fontSize: 14,
                          }}>
                            <Squares2X2Icon className="w-4 h-4" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Ürün</div>
                            <div style={{ fontSize: 12, color: '#999' }}>Envanter</div>
                          </div>
                        </div>
                      )}
                      {/* Sales Items */}
                      {activeModuleCodes.has('sales') && (
                        <>
                          <div
                            onClick={() => { router.push('/sales/orders/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#f59e0b15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#f59e0b',
                              fontSize: 14,
                            }}>
                              <ShoppingCartIcon className="w-4 h-4" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Sipariş</div>
                              <div style={{ fontSize: 12, color: '#999' }}>Satış</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/sales/invoices/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#f59e0b15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#f59e0b',
                              fontSize: 14,
                            }}>
                              <DocumentTextIcon className="w-4 h-4" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Fatura</div>
                              <div style={{ fontSize: 12, color: '#999' }}>Satış</div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* HR Items */}
                      {activeModuleCodes.has('hr') && (
                        <div
                          onClick={() => { router.push('/hr/employees/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#0ea5e915',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0ea5e9',
                            fontSize: 14,
                          }}>
                            <IdentificationIcon className="w-4 h-4" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Çalışan</div>
                            <div style={{ fontSize: 12, color: '#999' }}>İK</div>
                          </div>
                        </div>
                      )}
                      {/* Purchase Items */}
                      {activeModuleCodes.has('purchase') && (
                        <div
                          onClick={() => { router.push('/purchase/orders/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#8b5cf615',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8b5cf6',
                            fontSize: 14,
                          }}>
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Satın Alma</div>
                            <div style={{ fontSize: 12, color: '#999' }}>Satın Alma</div>
                          </div>
                        </div>
                      )}
                      {/* Finance Items */}
                      {activeModuleCodes.has('finance') && (
                        <div
                          onClick={() => { router.push('/finance/invoices/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 14,
                          }}>
                            <DocumentTextIcon className="w-4 h-4" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Fatura</div>
                            <div style={{ fontSize: 12, color: '#999' }}>Finans</div>
                          </div>
                        </div>
                      )}
                      {/* No modules active message */}
                      {activeModuleCodes.size === 0 && (
                        <div style={{ padding: '16px 12px', textAlign: 'center', color: '#999' }}>
                          Aktif modül bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                }
              >
                <Tooltip title="Hızlı Oluştur">
                  <button
                    type="button"
                    className="
                      w-8 h-8 flex items-center justify-center
                      bg-slate-900 hover:bg-slate-800
                      text-white rounded-lg transition-all duration-150
                    "
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Tooltip>
              </Popover>

              {/* Divider - Hidden on small mobile */}
              <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1 sm:mx-2" />

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: ({ key }) => handleUserMenuClick(key) }}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="
                    flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1.5
                    hover:bg-slate-100 rounded-lg transition-colors
                  "
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" strokeWidth={2} />
                </button>
              </Dropdown>
            </div>
          </Header>

          <Content style={{ overflow: 'initial' }}>
            {/* Responsive content padding */}
            <div className="m-3 sm:m-4 lg:mx-6 lg:mt-6">
              <div className="p-3 sm:p-4 lg:p-6 bg-white min-h-[360px] rounded-lg">
                {children}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      <DashboardContent>{children}</DashboardContent>
    </SignalRProvider>
  );
}
