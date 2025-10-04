import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Typography, Space, Spin, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CalculatorOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  ProjectOutlined,
  BarChartOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import userModulesService, { ModuleInfo } from '@/services/userModules.service';
import './sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

interface AdaptiveSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const moduleIcons: { [key: string]: React.ReactNode } = {
  dashboard: <DashboardOutlined />,
  crm: <TeamOutlined />,
  sales: <ShoppingCartOutlined />,
  inventory: <InboxOutlined />,
  accounting: <CalculatorOutlined />,
  hr: <UserOutlined />,
  production: <ToolOutlined />,
  projects: <ProjectOutlined />,
  analytics: <BarChartOutlined />,
};

export const AdaptiveSidebar: React.FC<AdaptiveSidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useSecureAuthStore();
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserModules();
  }, []);

  const loadUserModules = async () => {
    try {
      const data = await userModulesService.getActiveModules();
      setModules(data.modules);
    } catch (error) {
      console.error('Failed to load user modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/') return 'dashboard';
    const match = path.match(/\/app\/([^/]+)/);
    return match ? match[1] : 'dashboard';
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/app'),
    },
    {
      type: 'divider',
    },
    ...modules.map(module => ({
      key: module.code,
      icon: moduleIcons[module.code] || <AppstoreOutlined />,
      label: module.name,
      onClick: () => navigate(`/app/${module.code}`),
    })),
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => navigate('/app/settings'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/app/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  if (loading) {
    return (
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        width={250}
        className="tenant-sidebar"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin />
        </div>
      </Sider>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      className="tenant-sidebar"
      trigger={
        <div className="sidebar-trigger">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      }
    >
      {/* Logo */}
      <div className="sidebar-logo">
        {!collapsed ? (
          <Space>
            <Avatar
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              S
            </Avatar>
            <div>
              <Text strong style={{ color: '#fff', fontSize: 16 }}>
                STOOCKER
              </Text>
            </div>
          </Space>
        ) : (
          <Avatar
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            S
          </Avatar>
        )}
      </div>

      {/* User Info */}
      {user && (
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <div className="sidebar-user">
            <Space>
              <Avatar
                size={collapsed ? 'default' : 'large'}
                style={{ background: '#1890ff' }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              {!collapsed && (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Text
                    strong
                    style={{ color: '#fff', display: 'block' }}
                    ellipsis
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                    ellipsis
                  >
                    {user.email}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        </Dropdown>
      )}

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        className="sidebar-menu"
      />

      {/* Footer Info */}
      {!collapsed && (
        <div className="sidebar-footer">
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
            v1.0.0
          </Text>
        </div>
      )}
    </Sider>
  );
};
