import React from 'react';
import { Table, Tag, Button, Input, Card, Space, Tooltip, Avatar } from 'antd';
import {
    PlusOutlined,
    FilterOutlined,
    EditOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export const EmployeeList: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const employees = [
        { key: '1', name: 'John Doe', position: 'Software Engineer', department: 'IT', email: 'john@stocker.app', status: 'Active' },
        { key: '2', name: 'Jane Smith', position: 'Sales Manager', department: 'Sales', email: 'jane@stocker.app', status: 'Active' },
        { key: '3', name: 'Bob Johnson', position: 'HR Specialist', department: 'HR', email: 'bob@stocker.app', status: 'On Leave' },
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
                        <div className="text-xs text-slate-500">{record.email}</div>
                    </div>
                </Space>
            )
        },
        { title: 'Position', dataIndex: 'position', key: 'position' },
        { title: 'Department', dataIndex: 'department', key: 'department' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'green';
                if (status === 'On Leave') color = 'orange';
                if (status === 'Terminated') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
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
                <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('new')}>
                    Add Employee
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: '0' }}>
                <div className="p-4 border-b border-slate-100 flex justify-between">
                    <div className="flex space-x-2">
                        <Search placeholder="Search employees..." style={{ width: 300 }} allowClear />
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </div>
                    <Button>Export</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={employees}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};
