import React from 'react';
import { Card, Button, Row, Col, Statistic, Calendar, Badge } from 'antd';
import {
    PlusOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const HrDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">HR Management</h1>
                <div className="space-x-4">
                    <Button size="large" onClick={() => navigate('employees')}>
                        All Employees
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('employees/new')}>
                        Add Employee
                    </Button>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Employees"
                            value={45}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="On Leave"
                            value={3}
                            prefix={<CalendarOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Departments"
                            value={6}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Monthly Payroll"
                            value={450000}
                            precision={2}
                            prefix="₺"
                            valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <Card title="Attendance Overview" className="shadow-sm border-slate-200">
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            Attendance Chart Placeholder
                        </div>
                    </Card>
                </div>
                <Card title="Quick Actions" className="shadow-sm border-slate-200">
                    <div className="flex flex-col gap-4">
                        <Button icon={<CalendarOutlined />} onClick={() => navigate('leaves')}>Leave Requests</Button>
                        <Button icon={<DollarOutlined />} onClick={() => navigate('payroll')}>Payroll Processing</Button>
                        <Button icon={<UserOutlined />} onClick={() => navigate('departments')}>Departments</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
