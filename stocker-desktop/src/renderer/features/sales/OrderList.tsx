import React from 'react';
import { Table, Tag, Button, Input, Card, Space, Tooltip } from 'antd';
import {
    PlusOutlined,
    FilterOutlined,
    EyeOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export const OrderList: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const orders = [
        { key: '1', orderNo: 'ORD-2024-001', customer: 'Acme Corp', date: '2024-12-20', total: 4500.00, status: 'Completed' },
        { key: '2', orderNo: 'ORD-2024-002', customer: 'Global Tech', date: '2024-12-21', total: 1250.50, status: 'Pending' },
        { key: '3', orderNo: 'ORD-2024-003', customer: 'Local Shop', date: '2024-12-21', total: 850.00, status: 'Processing' },
    ];

    const columns: any = [
        { title: 'Order #', dataIndex: 'orderNo', key: 'orderNo', className: 'font-medium' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (val: number) => `₺${val.toFixed(2)}`
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'blue';
                if (status === 'Completed') color = 'green';
                if (status === 'Pending') color = 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Tooltip title="View Details">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate('view')} />
                    </Tooltip>
                    <Tooltip title="Print">
                        <Button type="text" icon={<PrinterOutlined />} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('new')}>
                    New Order
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: '0' }}>
                <div className="p-4 border-b border-slate-100 flex justify-between">
                    <div className="flex space-x-2">
                        <Search placeholder="Search orders..." style={{ width: 300 }} allowClear />
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </div>
                </div>
                <Table
                    columns={columns}
                    dataSource={orders}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};
