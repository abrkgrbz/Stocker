import React from 'react';
import { Card, Button, Row, Col, Statistic } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    WarningOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const InventoryDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                <div className="space-x-4">
                    <Button size="large" onClick={() => navigate('products')}>
                        View All Products
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('products/new')}>
                        Add Product
                    </Button>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('products')}>
                        <Statistic
                            title="Total Value"
                            value={245890}
                            precision={2}
                            prefix="₺"
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('products')}>
                        <Statistic
                            title="Total Products"
                            value={1245}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <Statistic
                            title="Low Stock"
                            value={12}
                            prefix={<WarningOutlined className="text-amber-500" />}
                            valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <Statistic
                            title="Out of Stock"
                            value={5}
                            prefix={<WarningOutlined className="text-red-500" />}
                            valueStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="grid grid-cols-2 gap-6">
                <Card title="Recent Movements" className="shadow-sm border-slate-200">
                    <p className="text-slate-400 text-center py-8">No recent movements</p>
                </Card>
                <Card title="Quick Actions" className="shadow-sm border-slate-200">
                    <div className="flex flex-wrap gap-4">
                        <Button icon={<InboxOutlined />} onClick={() => navigate('count')}>Stock Count</Button>
                        <Button icon={<SearchOutlined />} onClick={() => navigate('transfer')}>Transfer</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
