'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Spin, Button, Tooltip, Popover, Badge } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserAddOutlined,
  ContactsOutlined,
  DollarOutlined,
  RiseOutlined,
  CalendarOutlined,
  FunnelPlotOutlined,
  GroupOutlined,
  NotificationOutlined,
  FileOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WalletOutlined,
  InboxOutlined,
  SwapOutlined,
  CalculatorOutlined,
  HomeOutlined,
  TagsOutlined,
  TrademarkOutlined,
  ColumnWidthOutlined,
  ArrowLeftOutlined,
  BarcodeOutlined,
  WarningOutlined,
  EditOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  LockOutlined,
  AuditOutlined,
  LineChartOutlined,
  AccountBookOutlined,
  GiftOutlined,
  SlidersOutlined,
  SkinOutlined,
  BarChartOutlined,
  IdcardOutlined,
  ReconciliationOutlined,
  RollbackOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import { SignalRProvider } from '@/lib/signalr/signalr-context';
import { NotificationCenter } from '@/features/notifications/components';
import { useNotificationHub } from '@/lib/signalr/notification-hub';
import { ConnectionStatus } from '@/components/status';
import { useSignalRStatus } from '@/lib/signalr/use-signalr-status';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { message } from 'antd';

const { Header, Sider, Content } = Layout;

// Module configurations with their menu items
const MODULE_MENUS = {
  crm: {
    title: 'CRM',
    icon: <TeamOutlined />,
    color: '#7c3aed',
    moduleCode: 'crm',
    description: 'Müşteri ilişkileri yönetimi',
    items: [
      { key: '/crm', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'crm-customers',
        icon: <ContactsOutlined />,
        label: 'Müşteri Yönetimi',
        children: [
          { key: '/crm/customers', icon: <ContactsOutlined />, label: 'Müşteriler' },
          { key: '/crm/leads', icon: <UserAddOutlined />, label: 'Potansiyeller' },
          { key: '/crm/segments', icon: <GroupOutlined />, label: 'Segmentler' },
        ],
      },
      {
        key: 'crm-sales',
        icon: <RiseOutlined />,
        label: 'Satış Yönetimi',
        children: [
          { key: '/crm/opportunities', icon: <RiseOutlined />, label: 'Fırsatlar' },
          { key: '/crm/deals', icon: <DollarOutlined />, label: 'Anlaşmalar' },
          { key: '/crm/pipelines', icon: <FunnelPlotOutlined />, label: 'Pipeline' },
        ],
      },
      {
        key: 'crm-activities',
        icon: <CalendarOutlined />,
        label: 'Aktiviteler',
        children: [
          { key: '/crm/activities', icon: <CalendarOutlined />, label: 'Aktiviteler' },
          { key: '/crm/campaigns', icon: <NotificationOutlined />, label: 'Kampanyalar' },
        ],
      },
      {
        key: 'crm-tools',
        icon: <SettingOutlined />,
        label: 'Araçlar',
        children: [
          { key: '/crm/documents', icon: <FileOutlined />, label: 'Dökümanlar' },
          { key: '/crm/workflows', icon: <ThunderboltOutlined />, label: 'Workflows' },
        ],
      },
    ],
  },
  inventory: {
    title: 'Envanter',
    icon: <InboxOutlined />,
    color: '#10b981',
    moduleCode: 'inventory',
    description: 'Stok ve depo yönetimi',
    items: [
      { key: '/inventory', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'inv-products',
        icon: <AppstoreOutlined />,
        label: 'Ürün Yönetimi',
        children: [
          { key: '/inventory/products', icon: <AppstoreOutlined />, label: 'Ürünler' },
          { key: '/inventory/categories', icon: <TagsOutlined />, label: 'Kategoriler' },
          { key: '/inventory/brands', icon: <TrademarkOutlined />, label: 'Markalar' },
          { key: '/inventory/product-variants', icon: <SkinOutlined />, label: 'Varyantlar' },
          { key: '/inventory/product-bundles', icon: <GiftOutlined />, label: 'Paketler' },
        ],
      },
      {
        key: 'inv-stock',
        icon: <SwapOutlined />,
        label: 'Stok İşlemleri',
        children: [
          { key: '/inventory/stock', icon: <InboxOutlined />, label: 'Stok Görünümü' },
          { key: '/inventory/warehouses', icon: <HomeOutlined />, label: 'Depolar' },
          { key: '/inventory/stock-movements', icon: <SwapOutlined />, label: 'Hareketler' },
          { key: '/inventory/stock-transfers', icon: <SwapOutlined />, label: 'Transferler' },
          { key: '/inventory/stock-adjustments', icon: <EditOutlined />, label: 'Düzeltmeler' },
          { key: '/inventory/stock-counts', icon: <CalculatorOutlined />, label: 'Sayımlar' },
        ],
      },
      {
        key: 'inv-tracking',
        icon: <BarcodeOutlined />,
        label: 'İzleme & Takip',
        children: [
          { key: '/inventory/serial-numbers', icon: <BarcodeOutlined />, label: 'Seri Numaraları' },
          { key: '/inventory/lot-batches', icon: <InboxOutlined />, label: 'Lot/Parti' },
          { key: '/inventory/stock-reservations', icon: <LockOutlined />, label: 'Rezervasyonlar' },
          { key: '/inventory/stock-alerts', icon: <WarningOutlined />, label: 'Uyarılar' },
        ],
      },
      {
        key: 'inv-reports',
        icon: <BarChartOutlined />,
        label: 'Raporlar & Analiz',
        children: [
          { key: '/inventory/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
          { key: '/inventory/analytics', icon: <LineChartOutlined />, label: 'Analizler' },
          { key: '/inventory/analysis', icon: <BarChartOutlined />, label: 'ABC/XYZ Analizi' },
          { key: '/inventory/forecasting', icon: <LineChartOutlined />, label: 'Tahminleme' },
          { key: '/inventory/costing', icon: <AccountBookOutlined />, label: 'Maliyetlendirme' },
          { key: '/inventory/audit-trail', icon: <AuditOutlined />, label: 'Denetim İzi' },
        ],
      },
      {
        key: 'inv-settings',
        icon: <SettingOutlined />,
        label: 'Tanımlar',
        children: [
          { key: '/inventory/units', icon: <ColumnWidthOutlined />, label: 'Birimler' },
          { key: '/inventory/suppliers', icon: <ShopOutlined />, label: 'Tedarikçiler' },
          { key: '/inventory/locations', icon: <EnvironmentOutlined />, label: 'Lokasyonlar' },
          { key: '/inventory/price-lists', icon: <DollarOutlined />, label: 'Fiyat Listeleri' },
          { key: '/inventory/barcodes', icon: <BarcodeOutlined />, label: 'Barkodlar' },
          { key: '/inventory/product-attributes', icon: <SlidersOutlined />, label: 'Özellikler' },
        ],
      },
    ],
  },
  sales: {
    title: 'Satış',
    icon: <ShoppingCartOutlined />,
    color: '#f59e0b',
    moduleCode: 'sales',
    description: 'Sipariş ve fatura yönetimi',
    items: [
      { key: '/sales', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'sales-orders',
        icon: <ShoppingCartOutlined />,
        label: 'İşlemler',
        children: [
          { key: '/sales/orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
          { key: '/sales/invoices', icon: <FileTextOutlined />, label: 'Faturalar' },
          { key: '/sales/e-invoices', icon: <SafetyCertificateOutlined />, label: 'E-Fatura' },
        ],
      },
      {
        key: 'sales-finance',
        icon: <WalletOutlined />,
        label: 'Finans',
        children: [
          { key: '/sales/payments', icon: <WalletOutlined />, label: 'Ödemeler' },
          { key: '/sales/customers', icon: <ContactsOutlined />, label: 'Bakiyeler' },
        ],
      },
    ],
  },
  settings: {
    title: 'Ayarlar',
    icon: <SettingOutlined />,
    color: '#6b7280',
    moduleCode: null, // Always enabled
    description: 'Sistem ayarları',
    items: [
      { key: '/settings', icon: <SettingOutlined />, label: 'Genel Ayarlar' },
      {
        key: 'settings-org',
        icon: <TeamOutlined />,
        label: 'Organizasyon',
        children: [
          { key: '/settings/users', icon: <TeamOutlined />, label: 'Kullanıcılar' },
          { key: '/settings/roles', icon: <SafetyCertificateOutlined />, label: 'Roller' },
          { key: '/settings/departments', icon: <ApartmentOutlined />, label: 'Departmanlar' },
        ],
      },
      {
        key: 'settings-security',
        icon: <SafetyOutlined />,
        label: 'Güvenlik',
        children: [
          { key: '/settings/security', icon: <SafetyOutlined />, label: 'Güvenlik Ayarları' },
        ],
      },
    ],
  },
  communication: {
    title: 'İletişim',
    icon: <BellOutlined />,
    color: '#ec4899',
    moduleCode: null, // Always enabled
    description: 'Bildirim ve hatırlatıcılar',
    items: [
      { key: '/notifications', icon: <BellOutlined />, label: 'Bildirimler' },
      { key: '/reminders', icon: <ClockCircleOutlined />, label: 'Hatırlatıcılar' },
    ],
  },
  hr: {
    title: 'İnsan Kaynakları',
    icon: <IdcardOutlined />,
    color: '#0ea5e9',
    moduleCode: 'hr',
    description: 'Çalışan ve bordro yönetimi',
    items: [
      { key: '/hr', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'hr-employees',
        icon: <TeamOutlined />,
        label: 'Çalışan Yönetimi',
        children: [
          { key: '/hr/employees', icon: <TeamOutlined />, label: 'Çalışanlar' },
          { key: '/hr/departments', icon: <ApartmentOutlined />, label: 'Departmanlar' },
          { key: '/hr/positions', icon: <SafetyCertificateOutlined />, label: 'Pozisyonlar' },
        ],
      },
      {
        key: 'hr-attendance',
        icon: <ClockCircleOutlined />,
        label: 'Devam & İzin',
        children: [
          { key: '/hr/attendance', icon: <ClockCircleOutlined />, label: 'Devam Takibi' },
          { key: '/hr/leaves', icon: <CalendarOutlined />, label: 'İzinler' },
          { key: '/hr/leave-types', icon: <TagsOutlined />, label: 'İzin Türleri' },
          { key: '/hr/holidays', icon: <CalendarOutlined />, label: 'Tatil Günleri' },
        ],
      },
      {
        key: 'hr-payroll',
        icon: <DollarOutlined />,
        label: 'Bordro & Masraf',
        children: [
          { key: '/hr/payroll', icon: <DollarOutlined />, label: 'Bordro' },
          { key: '/hr/expenses', icon: <WalletOutlined />, label: 'Masraflar' },
        ],
      },
      {
        key: 'hr-performance',
        icon: <RiseOutlined />,
        label: 'Performans',
        children: [
          { key: '/hr/performance', icon: <RiseOutlined />, label: 'Değerlendirmeler' },
          { key: '/hr/goals', icon: <FunnelPlotOutlined />, label: 'Hedefler' },
        ],
      },
      {
        key: 'hr-training',
        icon: <SafetyCertificateOutlined />,
        label: 'Eğitim',
        children: [
          { key: '/hr/trainings', icon: <SafetyCertificateOutlined />, label: 'Eğitimler' },
        ],
      },
      {
        key: 'hr-tools',
        icon: <SettingOutlined />,
        label: 'Araçlar',
        children: [
          { key: '/hr/documents', icon: <FileOutlined />, label: 'Belgeler' },
          { key: '/hr/announcements', icon: <NotificationOutlined />, label: 'Duyurular' },
          { key: '/hr/shifts', icon: <ClockCircleOutlined />, label: 'Vardiyalar' },
          { key: '/hr/work-schedules', icon: <CalendarOutlined />, label: 'Çalışma Programları' },
          { key: '/hr/work-locations', icon: <EnvironmentOutlined />, label: 'Lokasyonlar' },
        ],
      },
    ],
  },
  purchase: {
    title: 'Satın Alma',
    icon: <ReconciliationOutlined />,
    color: '#8b5cf6',
    moduleCode: 'purchase',
    description: 'Tedarik ve satın alma yönetimi',
    items: [
      { key: '/purchase', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'purchase-suppliers',
        icon: <ShopOutlined />,
        label: 'Tedarikçi Yönetimi',
        children: [
          { key: '/purchase/suppliers', icon: <ShopOutlined />, label: 'Tedarikçiler' },
          { key: '/purchase/evaluations', icon: <LineChartOutlined />, label: 'Değerlendirmeler' },
        ],
      },
      {
        key: 'purchase-requests',
        icon: <FileOutlined />,
        label: 'Talepler & Teklifler',
        children: [
          { key: '/purchase/requests', icon: <FileOutlined />, label: 'Satın Alma Talepleri' },
          { key: '/purchase/quotations', icon: <FileDoneOutlined />, label: 'Teklif Talepleri (RFQ)' },
        ],
      },
      {
        key: 'purchase-orders',
        icon: <ShoppingCartOutlined />,
        label: 'Siparişler',
        children: [
          { key: '/purchase/orders', icon: <ShoppingCartOutlined />, label: 'Satın Alma Siparişleri' },
          { key: '/purchase/goods-receipts', icon: <InboxOutlined />, label: 'Mal Alım Belgeleri' },
        ],
      },
      {
        key: 'purchase-finance',
        icon: <FileTextOutlined />,
        label: 'Finans',
        children: [
          { key: '/purchase/invoices', icon: <FileTextOutlined />, label: 'Faturalar' },
          { key: '/purchase/payments', icon: <WalletOutlined />, label: 'Ödemeler' },
          { key: '/purchase/budgets', icon: <WalletOutlined />, label: 'Bütçeler' },
        ],
      },
      {
        key: 'purchase-pricing',
        icon: <DollarOutlined />,
        label: 'Fiyatlandırma',
        children: [
          { key: '/purchase/price-lists', icon: <DollarOutlined />, label: 'Fiyat Listeleri' },
        ],
      },
      {
        key: 'purchase-returns',
        icon: <RollbackOutlined />,
        label: 'İadeler',
        children: [
          { key: '/purchase/returns', icon: <RollbackOutlined />, label: 'İade Belgeleri' },
        ],
      },
      {
        key: 'purchase-reports',
        icon: <BarChartOutlined />,
        label: 'Raporlar',
        children: [
          { key: '/purchase/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
        ],
      },
    ],
  },
  modules: {
    title: 'Modüller',
    icon: <AppstoreOutlined />,
    color: '#0891b2',
    moduleCode: null, // Always enabled
    description: 'Modül yönetimi',
    items: [
      { key: '/modules', icon: <AppstoreOutlined />, label: 'Modül Yönetimi' },
    ],
  },
};

// Detect current module from pathname
function getCurrentModule(pathname: string): keyof typeof MODULE_MENUS | null {
  if (pathname.startsWith('/crm')) return 'crm';
  if (pathname.startsWith('/inventory')) return 'inventory';
  if (pathname.startsWith('/sales')) return 'sales';
  if (pathname.startsWith('/purchase')) return 'purchase';
  if (pathname.startsWith('/hr')) return 'hr';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/notifications') || pathname.startsWith('/reminders')) return 'communication';
  if (pathname.startsWith('/modules')) return 'modules';
  return null;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [moduleSwitcherOpen, setModuleSwitcherOpen] = useState(false);

  // Fetch active modules for the user
  const { data: modulesData } = useActiveModules();

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

  // Get SignalR connection status
  const connectionState = useSignalRStatus('notifications');

  // Check onboarding status
  const {
    wizardData,
    requiresOnboarding,
    loading: onboardingLoading,
    completeOnboarding
  } = useOnboarding();

  const handleOnboardingComplete = async (data: any): Promise<{ tenantId?: string; success?: boolean }> => {
    try {
      console.log('🚀 Onboarding data being sent:', data);
      const result = await completeOnboarding(data);
      console.log('✅ Onboarding complete response:', result);
      console.log('📊 provisioningStarted:', result.provisioningStarted);
      console.log('🏢 tenantId:', result.tenantId);

      // Don't show success message here - it will be shown by SetupProgressModal
      // Return tenantId for progress tracking
      // If provisioningStarted is true, the progress modal will show
      // Otherwise (tenant already active), redirect immediately
      const returnValue = {
        tenantId: result.provisioningStarted ? result.tenantId : undefined,
        success: true
      };
      console.log('🎯 Returning to OnboardingModal:', returnValue);
      return returnValue;
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      message.error('Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Get current module based on pathname
  const currentModule = useMemo(() => getCurrentModule(pathname), [pathname]);
  const moduleConfig = currentModule ? MODULE_MENUS[currentModule] : null;

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
      '/sales/orders': '/sales/orders',
      '/sales/invoices': '/sales/invoices',
      '/sales/e-invoices': '/sales/e-invoices',
      '/sales/payments': '/sales/payments',
      '/sales/customers': '/sales/customers',
      // HR Module
      '/hr/employees': '/hr/employees',
      '/hr/departments': '/hr/departments',
      '/hr/positions': '/hr/positions',
      '/hr/attendance': '/hr/attendance',
      '/hr/leaves': '/hr/leaves',
      '/hr/leave-types': '/hr/leave-types',
      '/hr/holidays': '/hr/holidays',
      '/hr/payroll': '/hr/payroll',
      '/hr/expenses': '/hr/expenses',
      '/hr/performance': '/hr/performance',
      '/hr/goals': '/hr/goals',
      '/hr/trainings': '/hr/trainings',
      '/hr/documents': '/hr/documents',
      '/hr/announcements': '/hr/announcements',
      '/hr/shifts': '/hr/shifts',
      '/hr/work-schedules': '/hr/work-schedules',
      '/hr/work-locations': '/hr/work-locations',
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
    };

    for (const [prefix, key] of Object.entries(routeMappings)) {
      if (pathname.startsWith(prefix)) return [key];
    }

    return [pathname];
  }, [pathname]);

  if (authLoading || tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleBackToApp = () => {
    router.push('/app');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Çıkış Yap', danger: true },
  ];

  const handleUserMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      router.push('/profile');
    }
  };

  return (
    <>
      <OnboardingModal
        visible={requiresOnboarding && !onboardingLoading}
        wizardData={wizardData || { currentStepIndex: 0, totalSteps: 4, progressPercentage: 0 }}
        onComplete={handleOnboardingComplete}
      />

      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          theme="light"
          width={240}
          style={{
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            borderRight: '1px solid #f0f0f0',
          }}
        >
          {/* Inner flex container to handle scroll properly */}
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
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToApp}
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
              {moduleConfig && (
                <Menu
                  mode="inline"
                  selectedKeys={getSelectedKeys}
                  items={moduleConfig.items}
                  onClick={({ key }) => handleMenuClick(key)}
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
                        onClick={() => router.push(config.items[0]?.key || `/${key}`)}
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
        </Sider>

        <Layout style={{ marginLeft: 240 }}>
          <Header
            style={{
              padding: '0 24px',
              background: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {/* Left: Tenant Name + Module Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#666' }}>
                {tenant?.name || 'Stocker'}
              </div>

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
                  icon={<AppstoreOutlined />}
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

            {/* Right: Status, Notifications, User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ConnectionStatus state={connectionState} size="small" />
              <NotificationCenter />
              <Dropdown
                menu={{ items: userMenuItems, onClick: ({ key }) => handleUserMenuClick(key) }}
                placement="bottomRight"
              >
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span style={{ fontSize: 14 }}>
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content style={{ overflow: 'initial' }}>
            <div style={{ margin: '24px 16px 0' }}>
              <div style={{ padding: 24, background: '#fff', minHeight: 360, borderRadius: 8 }}>
                {children}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
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
