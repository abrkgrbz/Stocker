import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { MasterHeader } from '../../components/Layout/MasterHeader';
import { MasterSidebar } from '../../components/Layout/MasterSidebar';
import { MasterFooter } from '../../components/Layout/MasterFooter';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useMasterLayout } from '../../hooks/useMasterLayout';
import './styles.css';

const { Content } = Layout;

export const MasterLayout: React.FC = () => {
  const {
    collapsed,
    setCollapsed,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    darkMode,
    setDarkMode,
    fullscreen,
    toggleFullscreen,
  } = useMasterLayout();

  return (
    <NotificationProvider>
      <Layout className="master-layout">
        <MasterSidebar 
          collapsed={collapsed}
          onCollapse={setCollapsed}
          mobileDrawerOpen={mobileDrawerOpen}
          onMobileDrawerClose={() => setMobileDrawerOpen(false)}
        />
        
        <Layout className="master-layout-main">
          <MasterHeader
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
            fullscreen={fullscreen}
            onFullscreenToggle={toggleFullscreen}
            onMobileMenuClick={() => setMobileDrawerOpen(true)}
          />
          
          <Content className="master-content">
            <div className="master-content-wrapper">
              <Outlet />
            </div>
          </Content>
          
          <MasterFooter />
        </Layout>
      </Layout>
    </NotificationProvider>
  );
};

export default MasterLayout;