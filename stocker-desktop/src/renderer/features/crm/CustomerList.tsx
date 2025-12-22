import React from 'react';
import { Table, Tag, Button, Input, Card, Space, Tooltip, Avatar } from 'antd';
import {
    PlusOutlined,
    FilterOutlined,
    EditOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export const CustomerList: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const customers = [
        { key: '1', name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 555 0101', type: 'VIP', status: 'Active' },
        { key: '2', name: 'Jane Smith', company: 'Global Tech', email: 'jane@global.com', phone: '+1 555 0102', type: 'Regular', status: 'Active' },
        { key: '3', name: 'Bob Johnson', company: 'Local Shop', email: 'bob@local.com', phone: '+1 555 0103', type: 'Lead', status: 'Inactive' },
    ];

    const columns: any = [
        {
            title: 'Name',
            key: 'name',
            render: (_: any, record: any) => (
                <Space>
                    <Avatar icon={<UserOutlined />} className="bg-slate-200 text-slate-600" />
                    <div>
                        <div className="font-medium text-slate-900">{record.name}</div>
                        <div className="text-xs text-slate-500">{record.company}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <div className="space-y-1">
                    <div className="flex items-center text-xs text-slate-600">
                        <MailOutlined className="mr-2" /> {record.email}
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                        <PhoneOutlined className="mr-2" /> {record.phone}
                    </div>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                let color = 'default';
                if (type === 'VIP') color = 'purple';
                if (type === 'Lead') color = 'blue';
                return <Tag color={color}>{type}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'success' : 'default'}>{status}</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} onClick={() => navigate('edit')} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('new')}>
                    Add Customer
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: '0' }}>
                <div className="p-4 border-b border-slate-100 flex justify-between">
                    <div className="flex space-x-2">
                        <Search placeholder="Search customers..." style={{ width: 300 }} allowClear />
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </div>
                    <Button>Export</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={customers}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};
