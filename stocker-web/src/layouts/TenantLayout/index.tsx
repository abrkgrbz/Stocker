import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  ContactsOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import { useAuthStore } from '@/app/store/auth.store';

export const TenantLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      path: `/app/${tenantId}`,
      name: 'Kontrol Paneli',
      icon: <DashboardOutlined />,
    },
    {
      path: `/app/${tenantId}/invoices`,
      name: 'Faturalar',
      icon: <FileTextOutlined />,
      badge: { count: 5, dot: true },
    },
    {
      path: `/app/${tenantId}/crm`,
      name: 'CRM',
      icon: <ContactsOutlined />,
    },
    {
      path: `/app/${tenantId}/inventory`,
      name: 'Stok',
      icon: <ShoppingCartOutlined />,
    },
    {
      path: `/app/${tenantId}/users`,
      name: 'Kullanıcılar',
      icon: <UserOutlined />,
    },
    {
      path: `/app/${tenantId}/settings`,
      name: 'Ayarlar',
      icon: <SettingOutlined />,
    },
  ];

  const settings: ProLayoutProps = {
    title: user?.tenantName || 'Stocker',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    layout: 'mix',
    splitMenus: false,
    navTheme: 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    colorPrimary: '#1890ff',
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
                onClick: () => navigate(`/app/${tenantId}/profile`),
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Ayarlar',
                onClick: () => navigate(`/app/${tenantId}/settings`),
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
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <span>{user?.username}</span>
          </div>
        </Dropdown>
      </div>
    ),
    route: {
      path: `/app/${tenantId}`,
      routes: menuItems,
    },
  };

  return (
    <ProLayout {...settings}>
      <Outlet />
    </ProLayout>
  );
};