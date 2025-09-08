import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout, ProLayoutProps, PageContainer } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  GlobalOutlined,
  CloudOutlined,
  FileTextOutlined,
  MonitorOutlined,
  SafetyOutlined,
  AuditOutlined,
  LineChartOutlined,
  PlusOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { 
  Dropdown, 
  Avatar, 
  Badge, 
  Space, 
  ConfigProvider, 
  theme,
  Input,
  Button,
  Switch,
  Tooltip,
  message,
} from 'antd';
import { useAuthStore } from '../stores/authStore';
import trTR from 'antd/locale/tr_TR';
import enUS from 'antd/locale/en_US';

const { useToken } = theme;

interface MenuItem {
  path: string;
  name: string;
  icon?: React.ReactNode;
  routes?: MenuItem[];
  hideInMenu?: boolean;
  target?: string;
}

const MasterLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locale, setLocale] = useState('tr');
  const [searchValue, setSearchValue] = useState('');
  const { token } = useToken();

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      name: locale === 'tr' ? 'Kontrol Paneli' : 'Dashboard',
      icon: <DashboardOutlined />,
    },
    {
      path: '/analytics',
      name: locale === 'tr' ? 'Analitik' : 'Analytics',
      icon: <LineChartOutlined />,
    },
    {
      path: '/tenants',
      name: 'Tenants',
      icon: <TeamOutlined />,
      routes: [
        {
          path: '/tenants/list',
          name: locale === 'tr' ? 'Tenant Listesi' : 'Tenant List',
          icon: <TeamOutlined />,
        },
        {
          path: '/tenants/domains',
          name: locale === 'tr' ? 'Domain Yönetimi' : 'Domain Management',
          icon: <GlobalOutlined />,
        },
        {
          path: '/tenants/migrations',
          name: locale === 'tr' ? 'Migrationlar' : 'Migrations',
          icon: <CloudOutlined />,
        },
      ],
    },
    {
      path: '/users',
      name: locale === 'tr' ? 'Kullanıcılar' : 'Users',
      icon: <UserOutlined />,
      routes: [
        {
          path: '/users/list',
          name: locale === 'tr' ? 'Kullanıcı Listesi' : 'User List',
          icon: <UserOutlined />,
        },
        {
          path: '/users/roles',
          name: locale === 'tr' ? 'Roller' : 'Roles',
          icon: <SafetyOutlined />,
        },
        {
          path: '/users/permissions',
          name: locale === 'tr' ? 'İzinler' : 'Permissions',
          icon: <AuditOutlined />,
        },
      ],
    },
    {
      path: '/packages',
      name: locale === 'tr' ? 'Paketler' : 'Packages',
      icon: <AppstoreOutlined />,
    },
    {
      path: '/subscriptions',
      name: locale === 'tr' ? 'Abonelikler' : 'Subscriptions',
      icon: <CreditCardOutlined />,
    },
    {
      path: '/invoices',
      name: locale === 'tr' ? 'Faturalar' : 'Invoices',
      icon: <FileTextOutlined />,
    },
    {
      path: '/reports',
      name: locale === 'tr' ? 'Raporlar' : 'Reports',
      icon: <BarChartOutlined />,
      routes: [
        {
          path: '/reports/revenue',
          name: locale === 'tr' ? 'Gelir Raporları' : 'Revenue Reports',
          icon: <LineChartOutlined />,
        },
        {
          path: '/reports/usage',
          name: locale === 'tr' ? 'Kullanım Raporları' : 'Usage Reports',
          icon: <BarChartOutlined />,
        },
        {
          path: '/reports/audit',
          name: locale === 'tr' ? 'Denetim Raporları' : 'Audit Reports',
          icon: <AuditOutlined />,
        },
      ],
    },
    {
      path: '/monitoring',
      name: locale === 'tr' ? 'İzleme' : 'Monitoring',
      icon: <MonitorOutlined />,
      routes: [
        {
          path: '/monitoring/system',
          name: locale === 'tr' ? 'Sistem İzleme' : 'System Monitoring',
          icon: <MonitorOutlined />,
        },
        {
          path: '/monitoring/logs',
          name: locale === 'tr' ? 'Loglar' : 'Logs',
          icon: <FileTextOutlined />,
        },
        {
          path: '/monitoring/alerts',
          name: locale === 'tr' ? 'Uyarılar' : 'Alerts',
          icon: <BellOutlined />,
        },
      ],
    },
    {
      path: '/settings',
      name: locale === 'tr' ? 'Ayarlar' : 'Settings',
      icon: <SettingOutlined />,
    },
  ];

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const handleLocaleChange = () => {
    const newLocale = locale === 'tr' ? 'en' : 'tr';
    setLocale(newLocale);
    message.success(newLocale === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English');
  };

  const settings: ProLayoutProps = {
    title: 'Stocker Master',
    logo: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#667eea"/>
        <path d="M10 22V14L16 10L22 14V22H10Z" fill="white"/>
        <path d="M14 22V18H18V22" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    layout: 'mix',
    splitMenus: false,
    navTheme: isDarkMode ? 'dark' : 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    colorPrimary: '#667eea',
    token: {
      pageContainer: {
        paddingBlockPageContainerContent: 24,
        paddingInlinePageContainerContent: 24,
      },
      header: {
        colorBgHeader: isDarkMode ? '#141414' : '#fff',
        colorHeaderTitle: isDarkMode ? '#fff' : '#000',
        colorTextMenu: isDarkMode ? '#fff' : '#595959',
        colorTextMenuSecondary: isDarkMode ? '#8c8c8c' : '#8c8c8c',
        colorTextMenuSelected: '#667eea',
        colorBgMenuItemSelected: 'rgba(102, 126, 234, 0.08)',
        colorTextMenuActive: '#667eea',
        colorTextRightActionsItem: isDarkMode ? '#fff' : '#595959',
      },
      sider: {
        colorMenuBackground: isDarkMode ? '#141414' : '#fff',
        colorMenuItemDivider: isDarkMode ? '#303030' : '#f0f0f0',
        colorBgMenuItemHover: 'rgba(102, 126, 234, 0.04)',
        colorTextMenu: isDarkMode ? '#fff' : '#595959',
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
      request: async () => menuItems,
    },
    menuItemRender: (item, dom) => (
      <a
        onClick={(e) => {
          e.preventDefault();
          if (item.path) {
            navigate(item.path);
          }
        }}
      >
        {dom}
      </a>
    ),
    headerContentRender: () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Input
          placeholder={locale === 'tr' ? 'Ara...' : 'Search...'}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>
    ),
    rightContentRender: () => (
      <Space size={16} style={{ paddingRight: 16 }}>
        {/* Quick Actions */}
        <Tooltip title={locale === 'tr' ? 'Yeni Tenant' : 'New Tenant'}>
          <Button 
            type="text" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/tenants/create')}
          />
        </Tooltip>

        <Tooltip title={locale === 'tr' ? 'Yenile' : 'Refresh'}>
          <Button 
            type="text" 
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          />
        </Tooltip>

        {/* Language Switcher */}
        <Tooltip title={locale === 'tr' ? 'Dil Değiştir' : 'Change Language'}>
          <Button 
            type="text" 
            icon={<TranslationOutlined />}
            onClick={handleLocaleChange}
          >
            {locale.toUpperCase()}
          </Button>
        </Tooltip>

        {/* Theme Switcher */}
        <Tooltip title={locale === 'tr' ? 'Tema' : 'Theme'}>
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            checked={isDarkMode}
            onChange={handleThemeChange}
          />
        </Tooltip>

        {/* Notifications */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'notification-1',
                label: (
                  <div style={{ width: 300 }}>
                    <div style={{ fontWeight: 600 }}>Yeni Tenant Oluşturuldu</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>ABC Corp. başarıyla oluşturuldu</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>5 dakika önce</div>
                  </div>
                ),
              },
              {
                key: 'notification-2',
                label: (
                  <div style={{ width: 300 }}>
                    <div style={{ fontWeight: 600 }}>Sistem Güncellendi</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>v2.0.1 sürümüne güncellendi</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>1 saat önce</div>
                  </div>
                ),
              },
              { type: 'divider' },
              {
                key: 'all-notifications',
                label: locale === 'tr' ? 'Tüm Bildirimleri Gör' : 'View All Notifications',
                onClick: () => navigate('/notifications'),
              },
            ],
          }}
          placement="bottomRight"
        >
          <Badge count={5} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>

        {/* Help */}
        <Tooltip title={locale === 'tr' ? 'Yardım' : 'Help'}>
          <Button 
            type="text" 
            icon={<QuestionCircleOutlined />}
            onClick={() => window.open('https://docs.stocker.app', '_blank')}
          />
        </Tooltip>

        {/* User Dropdown */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'user-info',
                label: (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 600 }}>{user?.name || 'Master Admin'}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.email || 'admin@stocker.app'}</div>
                    <div style={{ fontSize: 11, color: '#52c41a', marginTop: 4 }}>● Online</div>
                  </div>
                ),
                disabled: true,
              },
              { type: 'divider' },
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: locale === 'tr' ? 'Profil' : 'Profile',
                onClick: () => navigate('/profile'),
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: locale === 'tr' ? 'Ayarlar' : 'Settings',
                onClick: () => navigate('/settings'),
              },
              { type: 'divider' },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: locale === 'tr' ? 'Çıkış Yap' : 'Logout',
                danger: true,
                onClick: async () => {
                  await logout();
                  navigate('/login');
                },
              },
            ],
          }}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: '#667eea',
                cursor: 'pointer' 
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'M'}
            </Avatar>
            <span style={{ fontSize: 14 }}>{user?.name || 'Master Admin'}</span>
          </Space>
        </Dropdown>
      </Space>
    ),
    route: {
      path: '/',
      routes: menuItems,
    },
    breadcrumbRender: (routers = []) => {
      return [
        {
          path: '/',
          breadcrumbName: locale === 'tr' ? 'Ana Sayfa' : 'Home',
        },
        ...routers,
      ];
    },
    menuHeaderRender: (logo, title) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/dashboard')}
      >
        {logo}
        {!collapsed && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: isDarkMode ? '#fff' : '#000' }}>
              Stocker
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Master Admin</div>
          </div>
        )}
      </div>
    ),
    footerRender: () => (
      <div
        style={{
          textAlign: 'center',
          padding: '24px 50px',
          color: '#8c8c8c',
          fontSize: 13,
          backgroundColor: isDarkMode ? '#141414' : '#fafafa',
        }}
      >
        <div>Stocker Master Admin © 2024 - v2.0.0</div>
        <Space size={16} style={{ marginTop: 8 }}>
          <a href="#" style={{ color: '#667eea' }}>
            {locale === 'tr' ? 'Dokümantasyon' : 'Documentation'}
          </a>
          <a href="#" style={{ color: '#667eea' }}>API</a>
          <a href="#" style={{ color: '#667eea' }}>
            {locale === 'tr' ? 'Destek' : 'Support'}
          </a>
          <a href="#" style={{ color: '#667eea' }}>
            {locale === 'tr' ? 'Durum' : 'Status'}
          </a>
        </Space>
      </div>
    ),
    pageTitleRender: (props, defaultPageTitle) => {
      const title = props?.title || defaultPageTitle || 'Stocker Master Admin';
      return `${title} - Stocker`;
    },
    siderWidth: 256,
    headerHeight: 56,
    disableMobile: false,
    suppressSiderWhenMenuEmpty: true,
  };

  return (
    <ConfigProvider
      locale={locale === 'tr' ? trTR : enUS}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <ProLayout {...settings}>
        <Outlet />
      </ProLayout>
    </ConfigProvider>
  );
};

export default MasterLayout;