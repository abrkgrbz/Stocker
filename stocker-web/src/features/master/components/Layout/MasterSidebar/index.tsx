import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Layout, Menu, Button, Drawer, Badge, Tooltip, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  CloseOutlined,
  FireOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { menuItems } from './menuItems';
import './styles.css';

const { Sider } = Layout;
const { Search } = Input;

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
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter menu items based on search
  const filteredMenuItems = useMemo(() => {
    if (!searchValue) return menuItems;
    
    const filterItems = (items: any[]): any[] => {
      return items.reduce((acc, item) => {
        const labelMatch = item.label?.toLowerCase().includes(searchValue.toLowerCase());
        
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...item, children: filteredChildren });
          } else if (labelMatch) {
            acc.push(item);
          }
        } else if (labelMatch) {
          acc.push(item);
        }
        
        return acc;
      }, []);
    };
    
    return filterItems(menuItems);
  }, [searchValue]);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onMobileDrawerClose();
      setSearchValue('');
      setShowSearch(false);
    }
  };

  const getActiveKeys = () => {
    const path = location.pathname;
    const activeKeys = [];
    
    // Find parent menu keys for active item
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => child.key === path);
        if (hasActiveChild) {
          activeKeys.push(item.key);
        }
      }
    });
    
    return activeKeys;
  };

  const sidebarHeader = (
    <div className="sidebar-header">
      <div className="sidebar-logo">
        {collapsed ? (
          <div className="logo-collapsed">
            <Tooltip title="Stoocker Pro" placement="right">
              <FireOutlined className="logo-icon" />
            </Tooltip>
          </div>
        ) : (
          <div className="logo-expanded">
            <FireOutlined className="logo-icon" />
            <div className="logo-info">
              <span className="logo-text">Stoocker</span>
              <span className="logo-version">v3.0.0</span>
            </div>
            <Badge 
              status="success" 
              text="Pro" 
              className="logo-badge"
            />
          </div>
        )}
      </div>
      
      {!collapsed && (
        <div className="sidebar-toggle-internal">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)}
            className="toggle-btn"
          />
        </div>
      )}
    </div>
  );

  const sidebarSearch = !collapsed && (
    <div className={`sidebar-search ${showSearch ? 'active' : ''}`}>
      {showSearch ? (
        <Search
          placeholder="Menüde ara..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onBlur={() => {
            if (!searchValue) {
              setShowSearch(false);
            }
          }}
          autoFocus
          allowClear
          size="small"
          prefix={<SearchOutlined />}
          className="search-input"
        />
      ) : (
        <Button
          type="text"
          icon={<SearchOutlined />}
          onClick={() => setShowSearch(true)}
          className="search-trigger"
          block
        >
          Hızlı Arama
        </Button>
      )}
    </div>
  );

  const sidebarFooter = !collapsed && (
    <div className="sidebar-footer">
      <div className="sidebar-card gradient-card">
        <div className="card-content">
          <div className="card-icon">
            <RocketOutlined />
          </div>
          <div className="card-info">
            <h4>Premium Özellikler</h4>
            <p>Tüm özelliklere erişin</p>
          </div>
        </div>
        <Button type="primary" size="small" block className="card-btn">
          Yükselt
        </Button>
      </div>
      
      <div className="sidebar-actions">
        <Tooltip title="Yardım Merkezi">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            className="action-btn"
          />
        </Tooltip>
        <Tooltip title="Dokümantasyon">
          <Button
            type="text"
            icon={<BookOutlined />}
            className="action-btn"
          />
        </Tooltip>
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      {sidebarHeader}
      {sidebarSearch}
      
      <div className="sidebar-menu-wrapper">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getActiveKeys()}
          items={filteredMenuItems}
          onClick={handleMenuClick}
          className="master-sidebar-menu"
        />
      </div>
      
      {sidebarFooter}
    </>
  );

  const mobileHeader = (
    <div className="mobile-drawer-header">
      <div className="mobile-logo">
        <FireOutlined className="logo-icon" />
        <span className="logo-text">Stoocker</span>
      </div>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onMobileDrawerClose}
        className="close-btn"
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
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
        title={null}
        placement="left"
        onClose={onMobileDrawerClose}
        open={mobileDrawerOpen}
        className="mobile-sidebar-drawer"
        width={320}
        closeIcon={null}
        headerStyle={{ padding: 0 }}
      >
        {mobileHeader}
        
        <div className="mobile-search">
          <Search
            placeholder="Menüde ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
          />
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getActiveKeys()}
          items={filteredMenuItems}
          onClick={handleMenuClick}
          className="mobile-menu"
        />
        
        <div className="mobile-footer">
          <Button type="primary" block size="large" className="upgrade-btn">
            <RocketOutlined /> Premium'a Geç
          </Button>
        </div>
      </Drawer>
    </>
  );
};