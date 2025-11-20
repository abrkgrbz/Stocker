import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout, ProLayoutProps, PageContainer } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  DatabaseOutlined,
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
  CustomerServiceOutlined,
  ReconciliationOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
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
  AutoComplete,
  Divider,
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
  const [searchOptions, setSearchOptions] = useState<any[]>([]);
  const { token } = useToken();

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Keyboard shortcut for global search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="ara"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search data
  const searchData = [
    // Pages/Routes
    {
      type: 'page',
      title: locale === 'tr' ? 'Kontrol Paneli' : 'Dashboard',
      description: locale === 'tr' ? 'Ana sayfa ve genel istatistikler' : 'Main page and overview statistics',
      path: '/dashboard',
      icon: <DashboardOutlined />,
      keywords: ['dashboard', 'kontrol', 'panel', 'ana', 'istatistik', 'overview']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Analitik' : 'Analytics',
      description: locale === 'tr' ? 'Detaylı analiz ve raporlar' : 'Detailed analytics and reports',
      path: '/analytics',
      icon: <LineChartOutlined />,
      keywords: ['analytics', 'analitik', 'rapor', 'chart', 'grafik', 'istatistik', 'metrics']
    },
    {
      type: 'page',
      title: 'Tenants',
      description: locale === 'tr' ? 'Tenant yönetimi ve ayarları' : 'Tenant management and settings',
      path: '/tenants',
      icon: <TeamOutlined />,
      keywords: ['tenant', 'customer', 'müşteri', 'yönetim', 'management']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Kullanıcılar' : 'Users',
      description: locale === 'tr' ? 'Kullanıcı yönetimi ve roller' : 'User management and roles',
      path: '/users',
      icon: <UserOutlined />,
      keywords: ['user', 'kullanıcı', 'role', 'rol', 'permission', 'yetki', 'auth']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Roller' : 'Roles',
      description: locale === 'tr' ? 'Rol ve yetki yönetimi' : 'Role and permission management',
      path: '/users/roles',
      icon: <SafetyOutlined />,
      keywords: ['role', 'rol', 'yetki', 'permission', 'rbac', 'access', 'control']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'İzinler' : 'Permissions',
      description: locale === 'tr' ? 'Yetki ve izin yönetimi' : 'Permission and access management',
      path: '/users/permissions',
      icon: <AuditOutlined />,
      keywords: ['permission', 'izin', 'yetki', 'access', 'security', 'güvenlik']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Paketler' : 'Packages',
      description: locale === 'tr' ? 'Paket ve plan yönetimi' : 'Package and plan management',
      path: '/packages',
      icon: <AppstoreOutlined />,
      keywords: ['package', 'paket', 'plan', 'subscription', 'pricing', 'fiyat']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Abonelikler' : 'Subscriptions',
      description: locale === 'tr' ? 'Abonelik ve faturalandırma' : 'Subscription and billing',
      path: '/subscriptions',
      icon: <CreditCardOutlined />,
      keywords: ['subscription', 'abonelik', 'billing', 'faturalandırma', 'payment', 'ödeme']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Faturalar' : 'Invoices',
      description: locale === 'tr' ? 'Fatura yönetimi ve geçmişi' : 'Invoice management and history',
      path: '/invoices',
      icon: <ReconciliationOutlined />,
      keywords: ['invoice', 'fatura', 'billing', 'payment', 'ödeme', 'finance', 'mali']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'İzleme' : 'Monitoring',
      description: locale === 'tr' ? 'Sistem izleme ve performans' : 'System monitoring and performance',
      path: '/monitoring',
      icon: <MonitorOutlined />,
      keywords: ['monitoring', 'izleme', 'performance', 'performans', 'system', 'sistem', 'health']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Destek' : 'Support',
      description: locale === 'tr' ? 'Destek sistemi ve ticket\'lar' : 'Support system and tickets',
      path: '/support',
      icon: <CustomerServiceOutlined />,
      keywords: ['support', 'destek', 'ticket', 'help', 'yardım', 'customer', 'müşteri']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Denetim Günlükleri' : 'Audit Logs',
      description: locale === 'tr' ? 'Sistem denetim kayıtları' : 'System audit records',
      path: '/audit-logs',
      icon: <AuditOutlined />,
      keywords: ['audit', 'denetim', 'log', 'günlük', 'security', 'güvenlik', 'history', 'geçmiş']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Migration Yönetimi' : 'Migration Management',
      description: locale === 'tr' ? 'Tenant veritabanı migration\'ları ve CRM tablo yönetimi' : 'Tenant database migrations and CRM table management',
      path: '/tenants/migrations',
      icon: <DatabaseOutlined />,
      keywords: ['migration', 'database', 'veritabanı', 'crm', 'tables', 'tablolar', 'migrate', 'schema']
    },
    {
      type: 'page',
      title: locale === 'tr' ? 'Ayarlar' : 'Settings',
      description: locale === 'tr' ? 'Sistem ayarları ve konfigürasyon' : 'System settings and configuration',
      path: '/settings',
      icon: <SettingOutlined />,
      keywords: ['settings', 'ayarlar', 'config', 'konfigürasyon', 'preferences', 'tercihler']
    },
    // Quick Actions
    // Common Terms
    {
      type: 'term',
      title: locale === 'tr' ? 'API Anahtarları' : 'API Keys',
      description: locale === 'tr' ? 'API erişim anahtarları' : 'API access keys',
      path: '/settings',
      icon: <ApiOutlined />,
      keywords: ['api', 'key', 'anahtar', 'token', 'access', 'erişim', 'integration']
    },
    {
      type: 'term',
      title: locale === 'tr' ? 'Güvenlik' : 'Security',
      description: locale === 'tr' ? 'Güvenlik ayarları ve kontrolleri' : 'Security settings and controls',
      path: '/settings',
      icon: <SecurityScanOutlined />,
      keywords: ['security', 'güvenlik', 'auth', 'authentication', 'kimlik', 'protection']
    }
  ];

  // Search function
  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchOptions([]);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const filtered = searchData.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const descMatch = item.description.toLowerCase().includes(searchTerm);
      const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
      
      return titleMatch || descMatch || keywordMatch;
    });

    const options = filtered.slice(0, 8).map((item, index) => ({
      key: index,
      value: item.title,
      label: (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 0',
            cursor: 'pointer'
          }}
          onClick={() => {
            navigate(item.path);
            setSearchValue('');
            setSearchOptions([]);
          }}
        >
          <div style={{ marginRight: 12, fontSize: 16, color: '#667eea' }}>
            {item.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {item.description}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 8 }}>
            {item.type === 'page' ? (locale === 'tr' ? 'Sayfa' : 'Page') :
             item.type === 'action' ? (locale === 'tr' ? 'İşlem' : 'Action') :
             locale === 'tr' ? 'Terim' : 'Term'}
          </div>
        </div>
      )
    }));

    // Add "See all results" option if there are more results
    if (filtered.length > 8) {
      options.push({
        key: 'see-all',
        value: '',
        label: (
          <div style={{ 
            textAlign: 'center', 
            padding: '8px 0', 
            borderTop: '1px solid #f0f0f0',
            color: '#667eea',
            cursor: 'pointer'
          }}>
            {locale === 'tr' ? `${filtered.length - 8} sonuç daha...` : `${filtered.length - 8} more results...`}
          </div>
        )
      });
    }

    setSearchOptions(options);
  };

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
          path: '/tenants',
          name: locale === 'tr' ? 'Tenant Listesi' : 'Tenant List',
          icon: <TeamOutlined />,
        },
        {
          path: '/tenant-registrations',
          name: locale === 'tr' ? 'Kayıt Onayları' : 'Registration Approvals',
          icon: <CheckCircleOutlined />,
        },
        {
          path: '/tenants/migrations',
          name: locale === 'tr' ? 'Migration Yönetimi' : 'Migration Management',
          icon: <DatabaseOutlined />,
        },
      ],
    },
    {
      path: '/users',
      name: locale === 'tr' ? 'Kullanıcılar' : 'Users',
      icon: <UserOutlined />,
      routes: [
        {
          path: '/users',
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
      icon: <ReconciliationOutlined />,
    },
    {
      path: '/reports',
      name: locale === 'tr' ? 'Raporlar' : 'Reports',
      icon: <BarChartOutlined />,
    },
    {
      path: '/monitoring',
      name: locale === 'tr' ? 'İzleme' : 'Monitoring',
      icon: <MonitorOutlined />,
    },
    {
      path: '/hangfire',
      name: 'Hangfire Dashboard',
      icon: <ApiOutlined />,
    },
    {
      path: '/support',
      name: locale === 'tr' ? 'Destek' : 'Support',
      icon: <CustomerServiceOutlined />,
    },
    {
      path: '/audit-logs',
      name: locale === 'tr' ? 'Denetim Günlükleri' : 'Audit Logs',
      icon: <AuditOutlined />,
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
      <img
        src="/logo.png"
        alt="Stocker"
        style={{ width: '40px', height: '40px', objectFit: 'cover', objectPosition: 'center 35%' }}
      />
    ),
    layout: 'mix',
    splitMenus: false,
    navTheme: isDarkMode ? 'realDark' : 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    colorPrimary: '#667eea',
    contentStyle: {
      height: 'calc(100vh - 48px)',
      overflow: 'auto',
    },
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
        <AutoComplete
          value={searchValue}
          options={searchOptions}
          onSearch={handleSearch}
          onSelect={(value, option) => {
            if (option.key !== 'see-all') {
              // Navigation is handled in the option click
            }
          }}
          placeholder={locale === 'tr' ? 'Sayfalar, özellikler ve daha fazlasını ara...' : 'Search pages, features and more...'}
          style={{ width: 400 }}
          dropdownStyle={{ 
            minWidth: 400,
            maxHeight: 400,
            overflow: 'auto'
          }}
          allowClear
        >
          <Input
            prefix={<SearchOutlined />}
            suffix={
              searchValue && (
                <Tooltip title={locale === 'tr' ? 'Enter ile ara' : 'Press Enter to search'}>
                  <span style={{ fontSize: 11, color: '#bfbfbf' }}>
                    ⌘K
                  </span>
                </Tooltip>
              )
            }
          />
        </AutoComplete>
      </div>
    ),
    rightContentRender: () => (
      <Space size={16} style={{ paddingRight: 16 }}>
        {/* Quick Actions */}

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