import React from 'react';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout className="min-h-screen h-full bg-slate-50">
            <div className="dashboard-sider h-full">
                <Sidebar />
            </div>
            <Layout style={{ marginLeft: 260, transition: 'all 0.2s', minHeight: '100vh' }}>
                <Content className="p-6 min-h-screen bg-slate-50">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};
