import React from 'react';
import { Card, Button, Row, Col, Statistic } from 'antd';
import {
    PlusOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const SalesDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Sales Overview</h1>
                <div className="space-x-4">
                    <Button size="large" onClick={() => navigate('orders')}>
                        All Orders
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('orders/new')}>
                        New Order
                    </Button>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Today's Revenue"
                            value={12450}
                            precision={2}
                            prefix="₺"
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Pending Orders"
                            value={8}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Invoices"
                            value={3}
                            prefix={<FileTextOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Monthly Growth"
                            value={12.5}
                            suffix="%"
                            prefix={<DollarOutlined className="text-green-500" />}
                            valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="grid grid-cols-2 gap-6">
                <Card title="Recent Orders" className="shadow-sm border-slate-200">
                    <p className="text-slate-400 text-center py-8">No recent orders</p>
                </Card>
                <Card title="Quick Actions" className="shadow-sm border-slate-200">
                    <div className="flex flex-wrap gap-4">
                        <Button icon={<FileTextOutlined />} onClick={() => navigate('invoices')}>Invoices</Button>
                        <Button icon={<ShoppingCartOutlined />} onClick={() => navigate('customers')}>Customers</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
