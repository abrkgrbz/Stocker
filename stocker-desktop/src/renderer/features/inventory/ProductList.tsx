import React, { useState } from 'react';
import { Table, Tag, Button, Input, Card, Space, Tooltip } from 'antd';
import {
    PlusOutlined,
    FilterOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Mock Data
    const products = [
        { key: '1', code: 'PRD-001', name: 'Wireless Mouse', category: 'Electronics', stock: 145, unit: 'pcs', price: 450.00, status: 'In Stock' },
        { key: '2', code: 'PRD-002', name: 'Mechanical Keyboard', category: 'Electronics', stock: 12, unit: 'pcs', price: 1250.00, status: 'Low Stock' },
        { key: '3', code: 'PRD-003', name: 'Monitor 27"', category: 'Electronics', stock: 0, unit: 'pcs', price: 4500.00, status: 'Out of Stock' },
        { key: '4', code: 'PRD-004', name: 'USB-C Cable', category: 'Accessories', stock: 200, unit: 'pcs', price: 89.90, status: 'In Stock' },
        { key: '5', code: 'PRD-005', name: 'Laptop Stand', category: 'Accessories', stock: 45, unit: 'pcs', price: 349.00, status: 'In Stock' },
    ];

    const columns: any = [
        { title: 'Code', dataIndex: 'code', key: 'code', width: 120, className: 'font-medium' },
        { title: 'Product Name', dataIndex: 'name', key: 'name' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            width: 150,
            render: (stock: number, record: any) => (
                <span className={stock < 20 ? 'text-red-600 font-bold' : ''}>
                    {stock} {record.unit}
                </span>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (val: number) => `₺${val.toFixed(2)} `
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => {
                let color = 'green';
                if (status === 'Low Stock') color = 'warning';
                if (status === 'Out of Stock') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: () => (
                <Space>
                    <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} onClick={() => navigate('edit')} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('new')}>
                    Add Product
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: '0' }}>
                <div className="p-4 border-b border-slate-100 flex justify-between">
                    <div className="flex space-x-2">
                        <Search placeholder="Search by code or name..." style={{ width: 300 }} allowClear />
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </div>
                    <Button>Export</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={products}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>
        </div>
    );
};
