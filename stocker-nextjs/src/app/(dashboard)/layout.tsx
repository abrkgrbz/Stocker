'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Spin } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
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
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'crm',
      icon: <TeamOutlined />,
      label: 'CRM',
      children: [
        {
          key: '/crm/customers',
          label: 'Customers',
        },
        {
          key: '/crm/leads',
          label: 'Leads',
        },
        {
          key: '/crm/deals',
          label: 'Deals',
        },
        {
          key: '/crm/activities',
          label: 'Activities',
        },
      ],
    },
    {
      key: '/modules',
      icon: <AppstoreOutlined />,
      label: 'Modüller',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
    },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
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
          defaultSelectedKeys={['/dashboard']}
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

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
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
