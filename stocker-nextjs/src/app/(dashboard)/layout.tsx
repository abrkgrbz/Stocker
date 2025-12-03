'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Spin, Button, Tooltip } from 'antd';
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
import { message } from 'antd';

const { Header, Sider, Content } = Layout;

// Module configurations with their menu items
const MODULE_MENUS = {
  crm: {
    title: 'CRM',
    icon: <TeamOutlined />,
    color: '#7c3aed',
    items: [
      { key: '/crm', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/crm/customers', icon: <ContactsOutlined />, label: 'Müşteriler' },
      { key: '/crm/leads', icon: <UserAddOutlined />, label: 'Potansiyel Müşteriler' },
      { key: '/crm/deals', icon: <DollarOutlined />, label: 'Anlaşmalar' },
      { key: '/crm/opportunities', icon: <RiseOutlined />, label: 'Fırsatlar' },
      { key: '/crm/activities', icon: <CalendarOutlined />, label: 'Aktiviteler' },
      { key: '/crm/pipelines', icon: <FunnelPlotOutlined />, label: 'Satış Süreçleri' },
      { key: '/crm/segments', icon: <GroupOutlined />, label: 'Segmentler' },
      { key: '/crm/campaigns', icon: <NotificationOutlined />, label: 'Kampanyalar' },
      { key: '/crm/documents', icon: <FileOutlined />, label: 'Dökümanlar' },
      { key: '/crm/workflows', icon: <ThunderboltOutlined />, label: 'Workflows' },
    ],
  },
  inventory: {
    title: 'Envanter',
    icon: <InboxOutlined />,
    color: '#10b981',
    items: [
      { key: '/inventory', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/inventory/products', icon: <AppstoreOutlined />, label: 'Ürünler' },
      { key: '/inventory/warehouses', icon: <HomeOutlined />, label: 'Depolar' },
      { key: '/inventory/stock-movements', icon: <SwapOutlined />, label: 'Stok Hareketleri' },
      { key: '/inventory/stock-transfers', icon: <SwapOutlined />, label: 'Stok Transferleri' },
      { key: '/inventory/stock-counts', icon: <CalculatorOutlined />, label: 'Sayımlar' },
      { type: 'divider' as const },
      { type: 'group' as const, label: 'Tanımlar', children: [
        { key: '/inventory/categories', icon: <TagsOutlined />, label: 'Kategoriler' },
        { key: '/inventory/brands', icon: <TrademarkOutlined />, label: 'Markalar' },
        { key: '/inventory/units', icon: <ColumnWidthOutlined />, label: 'Birimler' },
      ]},
    ],
  },
  sales: {
    title: 'Satış',
    icon: <ShoppingCartOutlined />,
    color: '#f59e0b',
    items: [
      { key: '/sales', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/sales/orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
      { key: '/sales/invoices', icon: <FileTextOutlined />, label: 'Faturalar' },
      { key: '/sales/payments', icon: <WalletOutlined />, label: 'Ödemeler' },
    ],
  },
  settings: {
    title: 'Ayarlar',
    icon: <SettingOutlined />,
    color: '#6b7280',
    items: [
      { key: '/settings', icon: <SettingOutlined />, label: 'Genel' },
      { type: 'group' as const, label: 'Kullanıcılar & Roller', children: [
        { key: '/settings/users', icon: <TeamOutlined />, label: 'Kullanıcılar' },
        { key: '/settings/roles', icon: <SafetyCertificateOutlined />, label: 'Roller' },
        { key: '/settings/departments', icon: <ApartmentOutlined />, label: 'Departmanlar' },
      ]},
      { type: 'group' as const, label: 'Güvenlik', children: [
        { key: '/settings/security', icon: <SafetyOutlined />, label: 'Güvenlik' },
      ]},
    ],
  },
  communication: {
    title: 'İletişim',
    icon: <BellOutlined />,
    color: '#ec4899',
    items: [
      { key: '/notifications', icon: <BellOutlined />, label: 'Bildirimler' },
      { key: '/reminders', icon: <ClockCircleOutlined />, label: 'Hatırlatıcılar' },
    ],
  },
  modules: {
    title: 'Modüller',
    icon: <AppstoreOutlined />,
    color: '#0891b2',
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

  const handleOnboardingComplete = async (data: any) => {
    try {
      await completeOnboarding(data);
      message.success('Kurulum başarıyla tamamlandı! Hoş geldiniz! 🎉');
    } catch (error) {
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
      '/inventory/warehouses': '/inventory/warehouses',
      '/inventory/stock-movements': '/inventory/stock-movements',
      '/inventory/stock-transfers': '/inventory/stock-transfers',
      '/inventory/stock-counts': '/inventory/stock-counts',
      '/inventory/categories': '/inventory/categories',
      '/inventory/brands': '/inventory/brands',
      '/inventory/units': '/inventory/units',
      '/sales/orders': '/sales/orders',
      '/sales/invoices': '/sales/invoices',
      '/sales/payments': '/sales/payments',
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
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            borderRight: '1px solid #f0f0f0',
          }}
        >
          {/* Module Header */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid #f0f0f0',
              gap: 12,
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

          {/* Module Menu */}
          {moduleConfig && (
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys}
              items={moduleConfig.items}
              onClick={({ key }) => handleMenuClick(key)}
              style={{ borderRight: 0, paddingTop: 8 }}
            />
          )}

          {/* Quick Module Switch - Bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
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
            {/* Left: Tenant Name */}
            <div style={{ fontWeight: 600, fontSize: 15, color: '#666' }}>
              {tenant?.name || 'Stocker'}
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
