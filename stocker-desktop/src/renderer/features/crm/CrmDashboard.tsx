import React from 'react';
import { Card, Button, Row, Col, Statistic, Progress } from 'antd';
import {
    PlusOutlined,
    TeamOutlined,
    UserAddOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const CrmDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">CRM Overview</h1>
                <div className="space-x-4">
                    <Button size="large" onClick={() => navigate('customers')}>
                        View All Customers
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('customers/new')}>
                        Add Customer
                    </Button>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Customers"
                            value={854}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="New Leads"
                            value={24}
                            prefix={<UserAddOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Deals"
                            value={12}
                            prefix={<TrophyOutlined className="text-amber-500" />}
                            valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Conversion Rate"
                            value={8.5}
                            suffix="%"
                            valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="grid grid-cols-2 gap-6">
                <Card title="Sales Pipeline" className="shadow-sm border-slate-200">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">Prospecting</span>
                                <span className="text-sm font-medium text-slate-700">12 Leads</span>
                            </div>
                            <Progress percent={40} status="active" strokeColor="#3b82f6" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">Negotiation</span>
                                <span className="text-sm font-medium text-slate-700">5 Deals</span>
                            </div>
                            <Progress percent={25} status="active" strokeColor="#f59e0b" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">Closed Won</span>
                                <span className="text-sm font-medium text-slate-700">8 Deals</span>
                            </div>
                            <Progress percent={80} status="success" strokeColor="#22c55e" />
                        </div>
                    </div>
                </Card>
                <Card title="Quick Actions" className="shadow-sm border-slate-200">
                    <div className="flex flex-wrap gap-4">
                        <Button icon={<UserAddOutlined />} onClick={() => navigate('leads/new')}>Add Lead</Button>
                        <Button icon={<TrophyOutlined />} onClick={() => navigate('deals/new')}>Create Deal</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
