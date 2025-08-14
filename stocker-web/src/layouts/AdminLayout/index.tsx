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
} from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import { useAuthStore } from '@/app/store/auth.store';

const menuItems = [
  {
    path: '/admin',
    name: 'Kontrol Paneli',
    icon: <DashboardOutlined />,
  },
  {
    path: '/admin/tenants',
    name: 'Kiracılar',
    icon: <TeamOutlined />,
  },
  {
    path: '/admin/packages',
    name: 'Paketler',
    icon: <AppstoreOutlined />,
  },
  {
    path: '/admin/subscriptions',
    name: 'Abonelikler',
    icon: <CreditCardOutlined />,
  },
  {
    path: '/admin/users',
    name: 'Kullanıcılar',
    icon: <UserOutlined />,
  },
  {
    path: '/admin/reports',
    name: 'Raporlar',
    icon: <BarChartOutlined />,
  },
  {
    path: '/admin/settings',
    name: 'Ayarlar',
    icon: <SettingOutlined />,
  },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const settings: ProLayoutProps = {
    title: 'Stocker Admin',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    layout: 'mix',
    splitMenus: false,
    navTheme: 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    colorPrimary: '#667eea',
    token: {
      pageContainer: {
        paddingBlockPageContainerContent: 32,
        paddingInlinePageContainerContent: 40,
      },
      header: {
        colorBgHeader: '#fff',
        colorHeaderTitle: '#000',
        colorTextMenu: '#595959',
        colorTextMenuSecondary: '#8c8c8c',
        colorTextMenuSelected: '#667eea',
        colorBgMenuItemSelected: 'rgba(102, 126, 234, 0.08)',
        colorTextMenuActive: '#667eea',
        colorTextRightActionsItem: '#595959',
      },
      sider: {
        colorMenuBackground: '#fff',
        colorMenuItemDivider: '#f0f0f0',
        colorBgMenuItemHover: 'rgba(102, 126, 234, 0.04)',
        colorTextMenu: '#595959',
        colorTextMenuSelected: '#667eea',
        colorBgMenuItemSelected: 'rgba(102, 126, 234, 0.08)',
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
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Profil',
                onClick: () => navigate('/admin/profile'),
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Ayarlar',
                onClick: () => navigate('/admin/settings'),
              },
              {
                type: 'divider',
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Çıkış Yap',
                onClick: async () => {
                  await logout();
                  navigate('/login');
                },
              },
            ],
          }}
        >
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
              {user?.email?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <span>{user?.fullName || user?.username}</span>
          </div>
        </Dropdown>
      </div>
    ),
    route: {
      path: '/admin',
      routes: menuItems,
    },
  };

  return (
    <ProLayout {...settings}>
      <Outlet />
    </ProLayout>
  );
};