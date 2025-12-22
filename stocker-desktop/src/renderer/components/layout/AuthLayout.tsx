import React from 'react';
import { Layout, Card } from 'antd';

const { Content } = Layout;

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <Layout className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Content className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stocker</h1>
                    <p className="text-slate-500 mt-2">Enterprise Resource Planning</p>
                </div>

                <Card
                    className="shadow-sm border-slate-200"
                    bodyStyle={{ padding: '2rem' }}
                >
                    {title && (
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </Card>

                <div className="text-center mt-8 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Stocker. All rights reserved.
                </div>
            </Content>
        </Layout>
    );
};
