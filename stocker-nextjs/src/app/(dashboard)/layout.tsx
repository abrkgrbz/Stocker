'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Spin } from 'antd';
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
  LockOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import { SignalRProvider } from '@/lib/signalr/signalr-context';
import { NotificationCenter } from '@/features/notifications/components';
import { useNotificationHub } from '@/lib/signalr/notification-hub';
import { ConnectionStatus } from '@/components/status';
import { useSignalRStatus } from '@/lib/signalr/use-signalr-status';

const { Header, Sider, Content } = Layout;

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  // Initialize SignalR notification hub
  useNotificationHub();

  // Get SignalR connection status
  const connectionState = useSignalRStatus('notifications');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to auth subdomain for login
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Update openKeys when pathname changes
  useEffect(() => {
    const newOpenKeys: string[] = [];

    if (pathname.startsWith('/crm')) {
      newOpenKeys.push('crm');
    }

    if (pathname.startsWith('/settings')) {
      newOpenKeys.push('settings');
    }

    setOpenKeys(newOpenKeys);
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

  const menuItems = [
    {
      key: '/app',
      icon: <DashboardOutlined />,
      label: 'Ana Sayfa',
    },
    {
      key: 'crm',
      icon: <TeamOutlined />,
      label: 'CRM',
      children: [
        {
          key: '/crm',
          icon: <DashboardOutlined />,
          label: 'CRM Dashboard',
        },
        {
          key: '/crm/customers',
          icon: <ContactsOutlined />,
          label: 'Müşteriler',
        },
        {
          key: '/crm/leads',
          icon: <UserAddOutlined />,
          label: 'Potansiyel Müşteriler',
        },
        {
          key: '/crm/deals',
          icon: <DollarOutlined />,
          label: 'Anlaşmalar',
        },
        {
          key: '/crm/opportunities',
          icon: <RiseOutlined />,
          label: 'Fırsatlar',
        },
        {
          key: '/crm/activities',
          icon: <CalendarOutlined />,
          label: 'Aktiviteler',
        },
        {
          key: '/crm/pipelines',
          icon: <FunnelPlotOutlined />,
          label: 'Satış Süreçleri',
        },
        {
          key: '/crm/segments',
          icon: <GroupOutlined />,
          label: 'Müşteri Segmentleri',
        },
        {
          key: '/crm/campaigns',
          icon: <NotificationOutlined />,
          label: 'Kampanyalar',
        },
      ],
    },
    {
      key: '/modules',
      icon: <AppstoreOutlined />,
      label: 'Modüller',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Ayarlar Ana Sayfa',
        },
        {
          type: 'group',
          label: 'Genel',
          children: [
            {
              key: '/settings/general',
              icon: <ControlOutlined />,
              label: 'Genel Ayarlar',
            },
          ],
        },
        {
          type: 'group',
          label: 'Kullanıcılar & Roller',
          children: [
            {
              key: '/settings/users',
              icon: <TeamOutlined />,
              label: 'Kullanıcılar',
            },
            {
              key: '/settings/roles',
              icon: <SafetyCertificateOutlined />,
              label: 'Roller',
            },
            {
              key: '/settings/departments',
              icon: <ApartmentOutlined />,
              label: 'Departmanlar',
            },
          ],
        },
        {
          type: 'group',
          label: 'Güvenlik',
          children: [
            {
              key: '/settings/security',
              icon: <SafetyOutlined />,
              label: 'Güvenlik Ayarları',
            },
          ],
        },
      ],
    },
  ];

  // Calculate selected and open keys based on current pathname
  const getSelectedKeys = () => {
    // Direct match
    if (pathname === '/app') return ['/app'];
    if (pathname === '/modules') return ['/modules'];

    // CRM routes
    if (pathname.startsWith('/crm')) return [pathname];

    // Settings routes
    if (pathname.startsWith('/settings')) return [pathname];

    return [pathname];
  };

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
    },
  ];

  const handleUserMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      router.push('/profile');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          {tenant?.name || 'Stocker'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <ConnectionStatus state={connectionState} size="small" />
          <NotificationCenter />

          <Dropdown
            menu={{ items: userMenuItems, onClick: ({ key }) => handleUserMenuClick(key) }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </Dropdown>
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
