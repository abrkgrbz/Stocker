import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Button,
  Input,
  Tooltip,
  Switch,
  Drawer,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  QuestionCircleOutlined,
  TranslationOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ApiOutlined,
  CloudServerOutlined,
  DollarOutlined,
  GiftOutlined,
  CloudDownloadOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  FireOutlined,
  HeartOutlined,
  StarOutlined,
  SyncOutlined,
  ControlOutlined,
  MonitorOutlined,
  WarningOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationProvider } from '@/features/master/contexts/NotificationContext';
import { NotificationBell } from '@/features/master/components/NotificationBell';
import './styles.css';
import './sidebar-fix.css';
import './global-fixes.css';
import './content-fix.css';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  type?: 'divider';
  badge?: number;
}

const MetronicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Menu items with Metronic style icons and structure
  const menuItems: MenuItem[] = [
    {
      key: '/master',
      icon: <DashboardOutlined className="menu-icon" />,
      label: 'Kontrol Paneli',
      badge: 0,
    },
    {
      key: 'divider-1',
      type: 'divider',
    },
    {
      key: 'apps',
      icon: <AppstoreOutlined className="menu-icon" />,
      label: 'Uygulamalar',
      children: [
        {
          key: '/master/tenants',
          icon: <TeamOutlined className="menu-icon" />,
          label: 'Kiracılar',
          badge: 23,
          children: [
            {
              key: '/master/tenants/list',
              label: 'Tüm Tenantlar',
            },
            {
              key: '/master/tenants/pending',
              label: 'Onay Bekleyenler',
            },
            {
              key: '/master/tenants/suspended',
              label: 'Askıya Alınanlar',
            },
          ],
        },
        {
          key: '/master/packages',
          icon: <GiftOutlined className="menu-icon" />,
          label: 'Paketler',
        },
        {
          key: '/master/users',
          icon: <UserOutlined className="menu-icon" />,
          label: 'Sistem Kullanıcıları',
          badge: 5,
        },
        {
          key: '/master/modules',
          icon: <ControlOutlined className="menu-icon" />,
          label: 'Modüller',
        },
      ],
    },
    {
      key: 'finance',
      icon: <DollarOutlined className="menu-icon" />,
      label: 'Finans',
      children: [
        {
          key: '/master/subscriptions',
          icon: <CrownOutlined className="menu-icon" />,
          label: 'Abonelikler',
          children: [
            {
              key: '/master/subscriptions/active',
              label: 'Aktif Abonelikler',
            },
            {
              key: '/master/subscriptions/expired',
              label: 'Süresi Dolanlar',
            },
            {
              key: '/master/subscriptions/invoices',
              label: 'Abonelik Faturaları',
            },
          ],
        },
        {
          key: '/master/invoices',
          icon: <FileTextOutlined className="menu-icon" />,
          label: 'Faturalar',
          badge: 12,
        },
        {
          key: '/master/payments',
          icon: <ShoppingCartOutlined className="menu-icon" />,
          label: 'Ödemeler',
        },
        {
          key: '/master/billing',
          icon: <DollarOutlined className="menu-icon" />,
          label: 'Faturalama Yönetimi',
        },
        {
          key: '/master/backup',
          icon: <CloudDownloadOutlined className="menu-icon" />,
          label: 'Backup & Restore',
        },
        {
          key: '/master/email-templates',
          icon: <MailOutlined className="menu-icon" />,
          label: 'E-posta Şablonları',
        },
      ],
    },
    {
      key: 'monitoring',
      icon: <BarChartOutlined className="menu-icon" />,
      label: 'İzleme',
      children: [
        {
          key: '/master/monitoring',
          icon: <MonitorOutlined className="menu-icon" />,
          label: 'Sistem İzleme',
          children: [
            {
              key: '/master/monitoring/system',
              label: 'Sistem Durumu',
            },
            {
              key: '/master/monitoring/performance',
              label: 'Performans',
            },
            {
              key: '/master/monitoring/logs',
              label: 'Loglar',
            },
            {
              key: '/master/monitoring/errors',
              label: 'Hatalar',
            },
          ],
        },
        {
          key: '/master/reports',
          icon: <BarChartOutlined className="menu-icon" />,
          label: 'Raporlar',
          children: [
            {
              key: '/master/reports/revenue',
              label: 'Gelir Raporu',
            },
            {
              key: '/master/reports/usage',
              label: 'Kullanım Raporu',
            },
            {
              key: '/master/reports/growth',
              label: 'Büyüme Analizi',
            },
          ],
        },
        {
          key: '/master/analytics',
          icon: <BarChartOutlined className="menu-icon" />,
          label: 'Analitik',
        },
        {
          key: '/master/performance',
          icon: <ThunderboltOutlined className="menu-icon" />,
          label: 'Performans',
        },
        {
          key: '/master/audit-logs',
          icon: <FileTextOutlined className="menu-icon" />,
          label: 'Denetim Günlükleri',
        },
        {
          key: '/master/api-management',
          icon: <ApiOutlined className="menu-icon" />,
          label: 'API Yönetimi',
        },
      ],
    },
    {
      key: '/master/migrations',
      icon: <SyncOutlined className="menu-icon" />,
      label: 'Migration Yönetimi',
    },
    {
      key: 'divider-2',
      type: 'divider',
    },
    {
      key: '/master/settings',
      icon: <SettingOutlined className="menu-icon" />,
      label: 'Sistem Ayarları',
      children: [
        {
          key: '/master/settings/general',
          label: 'Genel Ayarlar',
        },
        {
          key: '/master/settings/email',
          label: 'E-posta Ayarları',
        },
        {
          key: '/master/settings/integrations',
          label: 'Entegrasyonlar',
        },
        {
          key: '/master/settings/backup',
          label: 'Yedekleme',
        },
        {
          key: '/master/settings/security',
          label: 'Güvenlik',
        },
      ],
    },
    {
      key: '/master/notification-settings',
      icon: <BellOutlined className="menu-icon" />,
      label: 'Bildirim Ayarları',
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilim',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Hesap Ayarları',
    },
    {
      key: 'divider',
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
    },
  ];

  // Notification items
  const notifications = [
    {
      id: 1,
      title: 'Yeni tenant kaydı',
      description: 'TechCorp Solutions kayıt oldu',
      time: '5 dakika önce',
      type: 'success',
      icon: <TeamOutlined />,
    },
    {
      id: 2,
      title: 'Payment received',
      description: 'Invoice #1234 has been paid',
      time: '1 hour ago',
      type: 'info',
      icon: <DollarOutlined />,
    },
    {
      id: 3,
      title: 'System update',
      description: 'New version 2.0 is available',
      time: '2 hours ago',
      type: 'warning',
      icon: <CloudServerOutlined />,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/master/profile');
    } else if (key === 'settings') {
      navigate('/master/settings');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
        <Badge count={notifications.length} />
      </div>
      <div className="notification-list">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <div className={`notification-icon ${notif.type}`}>
              {notif.icon}
            </div>
            <div className="notification-content">
              <h5>{notif.title}</h5>
              <p>{notif.description}</p>
              <span className="notification-time">
                <ClockCircleOutlined /> {notif.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="notification-footer">
        <Button type="link" block>
          View All Notifications
        </Button>
      </div>
    </div>
  );

  return (
    <NotificationProvider>
      <Layout className="metronic-layout">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="metronic-sidebar"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          {collapsed ? (
            <div className="logo-collapsed">
              <FireOutlined className="logo-icon" />
            </div>
          ) : (
            <div className="logo-expanded">
              <FireOutlined className="logo-icon" />
              <span className="logo-text">Stoocker</span>
              <span className="logo-badge">Pro</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['apps', 'finance']}
          items={menuItems}
          onClick={handleMenuClick}
          className="metronic-menu"
        />

        {/* Footer Actions */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-card">
              <div className="card-icon">
                <RocketOutlined />
              </div>
              <h4>Need Help?</h4>
              <p>Check our documentation</p>
              <Button type="primary" size="small" block>
                Documentation
              </Button>
            </div>
          </div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout className="main-layout">
        {/* Header */}
        <Header className="metronic-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="menu-trigger"
            />
            
            {/* Search Bar */}
            <Input
              prefix={<SearchOutlined />}
              placeholder="Ara..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="header-search"
              allowClear
            />
          </div>

          <div className="header-right">
            {/* Quick Actions */}
            <Space size="middle">
              {/* Language Switcher */}
              <LanguageSwitcher mode="dropdown" showName={false} />

              {/* Theme Switcher */}
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <Button
                  type="text"
                  icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                  onClick={() => setDarkMode(!darkMode)}
                  className="header-btn"
                />
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <Button
                  type="text"
                  icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={toggleFullscreen}
                  className="header-btn"
                />
              </Tooltip>

              {/* Master Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space className="user-menu">
                  <Avatar
                    size={32}
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <span className="user-name">{user?.name || 'Admin User'}</span>
                    <span className="user-role">System Admin</span>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content className="metronic-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        className="mobile-drawer"
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e);
            setMobileDrawerOpen(false);
          }}
        />
      </Drawer>
    </Layout>
    </NotificationProvider>
  );
};

export default MetronicLayout;