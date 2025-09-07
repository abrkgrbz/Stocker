import React from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ApiOutlined,
  DollarOutlined,
  GiftOutlined,
  CloudDownloadOutlined,
  MailOutlined,
  CrownOutlined,
  MonitorOutlined,
  SyncOutlined,
  ControlOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { menuItems } from './menuItems';
import './styles.css';

const { Sider } = Layout;

interface MasterSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileDrawerOpen: boolean;
  onMobileDrawerClose: () => void;
}

export const MasterSidebar: React.FC<MasterSidebarProps> = ({
  collapsed,
  onCollapse,
  mobileDrawerOpen,
  onMobileDrawerClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onMobileDrawerClose();
    }
  };

  const sidebarContent = (
    <>
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

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['apps', 'finance', 'monitoring']}
        items={menuItems}
        onClick={handleMenuClick}
        className="master-sidebar-menu"
      />

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-card">
            <div className="card-icon">
              <RocketOutlined />
            </div>
            <h4>Yardıma mı ihtiyacınız var?</h4>
            <p>Dokümantasyonu inceleyin</p>
            <Button type="primary" size="small" block>
              Dokümantasyon
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className="master-sidebar desktop-sidebar"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            onCollapse(true);
          }
        }}
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="Menü"
        placement="left"
        onClose={onMobileDrawerClose}
        open={mobileDrawerOpen}
        className="mobile-sidebar-drawer"
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="mobile-menu"
        />
      </Drawer>
    </>
  );
};