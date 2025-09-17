import React from 'react';
import { Outlet } from 'react-router-dom';

import { Layout } from 'antd';

import { ThemeProvider } from '@/core/theme';
import { MasterFooter } from '@/features/master/components/Layout/MasterFooter';
import { MasterHeader } from '@/features/master/components/Layout/MasterHeader';
import { MasterSidebar } from '@/features/master/components/Layout/MasterSidebar';
import { NotificationProvider } from '@/features/master/contexts/NotificationContext';
import { useMasterLayout } from '@/features/master/hooks/useMasterLayout';

const { Content } = Layout;

const MasterLayoutInner: React.FC = () => {
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
  );
};

export const MasterLayout: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="master-theme">
      <NotificationProvider>
        <MasterLayoutInner />
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default MasterLayout;