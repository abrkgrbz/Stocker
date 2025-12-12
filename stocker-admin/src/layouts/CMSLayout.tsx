import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  FileTextOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  MailOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  RocketOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  HistoryOutlined,
  SearchOutlined,
  TranslationOutlined,
  ReloadOutlined,
  SwapOutlined,
  StarOutlined,
  BankOutlined,
  BookOutlined,
} from '@ant-design/icons';
import {
  Dropdown,
  Avatar,
  Badge,
  Space,
  ConfigProvider,
  theme,
  Button,
  Switch,
  Tooltip,
  message,
  Input,
  AutoComplete,
} from 'antd';
import { useAuthStore } from '../stores/authStore';
import trTR from 'antd/locale/tr_TR';
import enUS from 'antd/locale/en_US';

interface MenuItem {
  path: string;
  name: string;
  icon?: React.ReactNode;
  routes?: MenuItem[];
  hideInMenu?: boolean;
}

const CMSLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [locale, setLocale] = useState('tr');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('cms-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const menuItems: MenuItem[] = [
    {
      path: '/cms/dashboard',
      name: locale === 'tr' ? 'Dashboard' : 'Dashboard',
      icon: <DashboardOutlined />,
    },
    {
      path: '/cms/pages',
      name: locale === 'tr' ? 'Sayfalar' : 'Pages',
      icon: <FileTextOutlined />,
      routes: [
        { path: '/cms/pages', name: locale === 'tr' ? 'Tüm Sayfalar' : 'All Pages', icon: <FileTextOutlined /> },
        { path: '/cms/pages/home', name: locale === 'tr' ? 'Ana Sayfa' : 'Home', icon: <HomeOutlined /> },
        { path: '/cms/pages/about', name: locale === 'tr' ? 'Hakkımızda' : 'About', icon: <InfoCircleOutlined /> },
        { path: '/cms/pages/contact', name: locale === 'tr' ? 'İletişim' : 'Contact', icon: <PhoneOutlined /> },
        { path: '/cms/pages/demo', name: 'Demo', icon: <RocketOutlined /> },
      ],
    },
    {
      path: '/cms/blog',
      name: 'Blog',
      icon: <ReadOutlined />,
      routes: [
        { path: '/cms/blog', name: locale === 'tr' ? 'Tüm Yazılar' : 'All Posts', icon: <ReadOutlined /> },
        { path: '/cms/blog/new', name: locale === 'tr' ? 'Yeni Yazı' : 'New Post', icon: <FormOutlined /> },
        { path: '/cms/blog/categories', name: locale === 'tr' ? 'Kategoriler' : 'Categories', icon: <TeamOutlined /> },
      ],
    },
    {
      path: '/cms/faq',
      name: locale === 'tr' ? 'SSS' : 'FAQ',
      icon: <QuestionCircleOutlined />,
    },
    {
      path: '/cms/landing',
      name: locale === 'tr' ? 'Landing Page' : 'Landing Page',
      icon: <StarOutlined />,
    },
    {
      path: '/cms/company',
      name: locale === 'tr' ? 'Şirket Sayfası' : 'Company Page',
      icon: <BankOutlined />,
    },
    {
      path: '/cms/docs',
      name: locale === 'tr' ? 'Dokümantasyon' : 'Documentation',
      icon: <BookOutlined />,
    },
    {
      path: '/cms/careers',
      name: locale === 'tr' ? 'Kariyer' : 'Careers',
      icon: <SolutionOutlined />,
      routes: [
        { path: '/cms/careers', name: locale === 'tr' ? 'Açık Pozisyonlar' : 'Open Positions', icon: <SolutionOutlined /> },
        { path: '/cms/careers/applications', name: locale === 'tr' ? 'Başvurular' : 'Applications', icon: <MailOutlined /> },
      ],
    },
    {
      path: '/cms/support',
      name: locale === 'tr' ? 'Destek' : 'Support',
      icon: <CustomerServiceOutlined />,
    },
    {
      path: '/cms/legal',
      name: locale === 'tr' ? 'Yasal' : 'Legal',
      icon: <SafetyOutlined />,
      routes: [
        { path: '/cms/legal/privacy', name: locale === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy', icon: <FileProtectOutlined /> },
        { path: '/cms/legal/terms', name: locale === 'tr' ? 'Kullanım Şartları' : 'Terms', icon: <FileProtectOutlined /> },
        { path: '/cms/legal/cookies', name: locale === 'tr' ? 'Çerez Politikası' : 'Cookie Policy', icon: <FileProtectOutlined /> },
        { path: '/cms/legal/kvkk', name: 'KVKK', icon: <SafetyOutlined /> },
      ],
    },
    {
      path: '/cms/updates',
      name: locale === 'tr' ? 'Güncellemeler' : 'Updates',
      icon: <HistoryOutlined />,
    },
    {
      path: '/cms/settings',
      name: locale === 'tr' ? 'CMS Ayarları' : 'CMS Settings',
      icon: <SettingOutlined />,
    },
  ];

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('cms-theme', checked ? 'dark' : 'light');
  };

  const handleLocaleChange = () => {
    const newLocale = locale === 'tr' ? 'en' : 'tr';
    setLocale(newLocale);
    message.success(newLocale === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English');
  };

  const settings: ProLayoutProps = {
    title: 'Stocker CMS',
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
    colorPrimary: '#f093fb',
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
        colorTextMenuSelected: '#f093fb',
        colorBgMenuItemSelected: 'rgba(240, 147, 251, 0.08)',
        colorTextMenuActive: '#f093fb',
        colorTextRightActionsItem: isDarkMode ? '#fff' : '#595959',
      },
      sider: {
        colorMenuBackground: isDarkMode ? '#141414' : '#fff',
        colorMenuItemDivider: isDarkMode ? '#303030' : '#f0f0f0',
        colorBgMenuItemHover: 'rgba(240, 147, 251, 0.04)',
        colorTextMenu: isDarkMode ? '#fff' : '#595959',
        colorTextMenuSelected: '#f093fb',
        colorBgMenuItemSelected: 'rgba(240, 147, 251, 0.08)',
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
          prefix={<SearchOutlined />}
          placeholder={locale === 'tr' ? 'Sayfa ara...' : 'Search pages...'}
          style={{ width: 300 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    ),
    rightContentRender: () => (
      <Space size={16} style={{ paddingRight: 16 }}>
        {/* Switch to Tenant Admin */}
        <Tooltip title={locale === 'tr' ? 'Tenant Yönetimine Geç' : 'Switch to Tenant Admin'}>
          <Button
            type="text"
            icon={<SwapOutlined />}
            onClick={() => navigate('/admin-home')}
          >
            Panel Seç
          </Button>
        </Tooltip>

        <Tooltip title={locale === 'tr' ? 'Yenile' : 'Refresh'}>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          />
        </Tooltip>

        <Tooltip title={locale === 'tr' ? 'Dil Değiştir' : 'Change Language'}>
          <Button
            type="text"
            icon={<TranslationOutlined />}
            onClick={handleLocaleChange}
          >
            {locale.toUpperCase()}
          </Button>
        </Tooltip>

        <Tooltip title={locale === 'tr' ? 'Tema' : 'Theme'}>
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            checked={isDarkMode}
            onChange={handleThemeChange}
          />
        </Tooltip>

        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined />} />
        </Badge>

        <Dropdown
          menu={{
            items: [
              {
                key: 'user-info',
                label: (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 600 }}>{user?.name || 'CMS Admin'}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.email || 'admin@stocker.app'}</div>
                  </div>
                ),
                disabled: true,
              },
              { type: 'divider' },
              {
                key: 'admin-home',
                icon: <HomeOutlined />,
                label: locale === 'tr' ? 'Panel Seçimi' : 'Panel Selection',
                onClick: () => navigate('/admin-home'),
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: locale === 'tr' ? 'Ayarlar' : 'Settings',
                onClick: () => navigate('/cms/settings'),
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
                backgroundColor: '#f093fb',
                cursor: 'pointer'
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </Avatar>
            <span style={{ fontSize: 14 }}>{user?.name || 'CMS Admin'}</span>
          </Space>
        </Dropdown>
      </Space>
    ),
    route: {
      path: '/cms',
      routes: menuItems,
    },
    breadcrumbRender: (routers = []) => {
      return [
        {
          path: '/cms',
          breadcrumbName: 'CMS',
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
        onClick={() => navigate('/cms/dashboard')}
      >
        {logo}
        {!collapsed && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: isDarkMode ? '#fff' : '#000' }}>
              Stocker
            </div>
            <div style={{ fontSize: 12, color: '#f093fb' }}>CMS</div>
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
        <div>Stocker CMS © 2024</div>
        <Space size={16} style={{ marginTop: 8 }}>
          <a href="#" style={{ color: '#f093fb' }}>
            {locale === 'tr' ? 'Yardım' : 'Help'}
          </a>
          <a href="/" target="_blank" style={{ color: '#f093fb' }}>
            {locale === 'tr' ? 'Siteyi Görüntüle' : 'View Site'}
          </a>
        </Space>
      </div>
    ),
    siderWidth: 256,
    headerHeight: 56,
  };

  return (
    <ConfigProvider
      locale={locale === 'tr' ? trTR : enUS}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#f093fb',
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

export default CMSLayout;
