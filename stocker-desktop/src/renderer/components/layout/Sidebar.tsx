import React, { useState } from 'react';
import { Layout, Menu, MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    InboxOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Map routes to menu keys
    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path === '/') return ['dashboard'];
        const parts = path.split('/');
        return parts.length > 1 ? [parts[1]] : ['dashboard'];
    };

    type MenuItem = Required<MenuProps>['items'][number];

    const menuItems: MenuItem[] = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/'),
        },
        {
            key: 'inventory',
            icon: <InboxOutlined />,
            label: 'Inventory',
            onClick: () => navigate('/inventory'),
        },
        {
            key: 'sales',
            icon: <ShoppingCartOutlined />,
            label: 'Sales',
            onClick: () => navigate('/sales'),
        },
        {
            key: 'crm',
            icon: <TeamOutlined />,
            label: 'CRM',
            onClick: () => navigate('/crm'),
        },
        {
            key: 'hr',
            icon: <UserOutlined />,
            label: 'HR',
            onClick: () => navigate('/hr'),
        },
        {
            type: 'divider',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => navigate('/settings'),
        },
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={260}
            theme="light"
            className="dashboard-sider border-r border-slate-200"
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 50,
            }}
        >
            <div className="flex items-center justify-center h-16 border-b border-gray-100">
                <h1 className={`font-bold text-xl text-slate-900 transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                    Stocker
                </h1>
            </div>

            <Menu
                mode="inline"
                selectedKeys={getSelectedKeys()}
                items={menuItems}
                className="h-full border-r-0 pt-2"
                style={{ background: 'transparent' }}
            />

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
                <div className={`text-xs text-gray-400 text-center ${collapsed ? 'hidden' : 'block'}`}>
                    Stocker Desktop v1.0
                </div>
            </div>
        </Sider>
    );
};
