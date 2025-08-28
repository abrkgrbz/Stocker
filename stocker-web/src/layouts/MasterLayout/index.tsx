import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloudServerOutlined,
  MonitorOutlined,
  SafetyOutlined,
  ApiOutlined,
  DollarOutlined,
  FileTextOutlined,
  BellOutlined,
  ControlOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Dropdown, Avatar, Badge, Space, Tag } from 'antd';
import { useAuthStore } from '@/app/store/auth.store';
import './style.css';

const menuItems = [
  {
    path: '/master',
    name: 'Kontrol Paneli',
    icon: <DashboardOutlined />,
  },
  {
    path: '/master/tenants',
    name: 'Kiracılar',
    icon: <TeamOutlined />,
    children: [
      {
        path: '/master/tenants/list',
        name: 'Tüm Tenantlar',
      },
      {
        path: '/master/tenants/pending',
        name: 'Onay Bekleyenler',
      },
      {
        path: '/master/tenants/suspended',
        name: 'Askıya Alınanlar',
      },
    ],
  },
  {
    path: '/master/subscriptions',
    name: 'Abonelikler',
    icon: <CreditCardOutlined />,
    children: [
      {
        path: '/master/subscriptions/active',
        name: 'Aktif Abonelikler',
      },
      {
        path: '/master/subscriptions/expired',
        name: 'Süresi Dolanlar',
      },
      {
        path: '/master/subscriptions/invoices',
        name: 'Faturalar',
      },
    ],
  },
  {
    path: '/master/packages',
    name: 'Paketler',
    icon: <AppstoreOutlined />,
  },
  {
    path: '/master/modules',
    name: 'Modüller',
    icon: <ControlOutlined />,
  },
  {
    path: '/master/users',
    name: 'Sistem Kullanıcıları',
    icon: <UserOutlined />,
  },
  {
    path: '/master/migrations',
    name: 'Migration Yönetimi',
    icon: <DatabaseOutlined />,
  },
  {
    path: '/master/monitoring',
    name: 'İzleme',
    icon: <MonitorOutlined />,
    children: [
      {
        path: '/master/monitoring/system',
        name: 'Sistem Durumu',
      },
      {
        path: '/master/monitoring/performance',
        name: 'Performans',
      },
      {
        path: '/master/monitoring/logs',
        name: 'Loglar',
      },
      {
        path: '/master/monitoring/errors',
        name: 'Hatalar',
      },
    ],
  },
  {
    path: '/master/reports',
    name: 'Raporlar',
    icon: <BarChartOutlined />,
    children: [
      {
        path: '/master/reports/revenue',
        name: 'Gelir Raporu',
      },
      {
        path: '/master/reports/usage',
        name: 'Kullanım Raporu',
      },
      {
        path: '/master/reports/growth',
        name: 'Büyüme Analizi',
      },
    ],
  },
  {
    path: '/master/settings',
    name: 'Sistem Ayarları',
    icon: <SettingOutlined />,
    children: [
      {
        path: '/master/settings/general',
        name: 'Genel Ayarlar',
      },
      {
        path: '/master/settings/email',
        name: 'E-posta Ayarları',
      },
      {
        path: '/master/settings/integrations',
        name: 'Entegrasyonlar',
      },
      {
        path: '/master/settings/backup',
        name: 'Yedekleme',
      },
      {
        path: '/master/settings/security',
        name: 'Güvenlik',
      },
    ],
  },
];

export const MasterLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const settings: ProLayoutProps = {
    title: 'Stocker Master',
    logo: (
      <div className="master-logo">
        <CloudServerOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
      </div>
    ),
    layout: 'mix',
    splitMenus: false,
    navTheme: 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    colorPrimary: '#ff4d4f',
    token: {
      pageContainer: {
        paddingBlockPageContainerContent: 32,
        paddingInlinePageContainerContent: 40,
      },
      header: {
        colorBgHeader: '#001529',
        colorHeaderTitle: '#fff',
        colorTextMenu: '#fff',
        colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
        colorTextMenuSelected: '#fff',
        colorBgMenuItemSelected: '#ff4d4f',
        colorTextMenuActive: '#fff',
        colorTextRightActionsItem: '#fff',
      },
      sider: {
        colorMenuBackground: '#001529',
        colorMenuItemDivider: 'rgba(255,255,255,0.15)',
        colorBgMenuItemHover: 'rgba(255,255,255,0.08)',
        colorTextMenu: 'rgba(255,255,255,0.75)',
        colorTextMenuSelected: '#fff',
        colorBgMenuItemSelected: '#ff4d4f',
      },
    },
    collapsed,
    onCollapse: setCollapsed,
    location: {
      pathname: location.pathname,
    },
    menu: {
      locale: false,
      defaultOpenAll: false,
    },
    menuItemRender: (item, dom) => (
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate(item.path || '/');
        }}
      >
        {dom}
      </a>
    ),
    rightContentRender: () => (
      <div style={{ paddingRight: 16 }}>
        <Space size="middle">
          {/* System Status */}
          <Tag color="success" icon={<SafetyOutlined />}>
            System Online
          </Tag>
          
          {/* Notifications */}
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: 18, color: 'white', cursor: 'pointer' }} />
          </Badge>

          {/* User Menu */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'info',
                  label: (
                    <div>
                      <div><strong>{user?.fullName || user?.username}</strong></div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>System Administrator</div>
                    </div>
                  ),
                  disabled: true,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: 'Profil',
                  onClick: () => navigate('/master/profile'),
                },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Ayarlar',
                  onClick: () => navigate('/master/settings'),
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Çıkış Yap',
                  danger: true,
                  onClick: async () => {
                    await logout();
                    navigate('/login');
                  },
                },
              ],
            }}
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar 
                size="small" 
                style={{ backgroundColor: '#ff4d4f' }}
                icon={<CloudServerOutlined />}
              >
                {user?.email?.[0]?.toUpperCase()}
              </Avatar>
              <span style={{ color: 'white' }}>{user?.fullName || user?.username}</span>
            </div>
          </Dropdown>
        </Space>
      </div>
    ),
    route: {
      path: '/master',
      routes: menuItems,
    },
    headerTitleRender: (logo, title) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {logo}
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>System Management</div>
        </div>
      </div>
    ),
  };

  return (
    <ProLayout {...settings}>
      <div className="master-content">
        <Outlet />
      </div>
    </ProLayout>
  );
};