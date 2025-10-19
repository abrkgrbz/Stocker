'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

// Customer type based on backend API
interface Customer {
  id: number;
  companyName: string;
  contactPerson: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  customerType: 'Individual' | 'Corporate';
  status: 'Active' | 'Inactive' | 'Potential';
  creditLimit: number;
  totalPurchases: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // TODO: Connect to real API
  // const { data, isLoading } = useQuery({
  //   queryKey: ['customers', currentPage, pageSize, searchText],
  //   queryFn: () => apiService.get('/crm/customers', {
  //     params: { pageNumber: currentPage, pageSize, search: searchText }
  //   })
  // });

  // Mock data for now
  const mockCustomers: Customer[] = [
    {
      id: 1,
      companyName: 'Acme Corporation',
      contactPerson: 'John Doe',
      email: 'john@acme.com',
      phone: '+90 555 123 4567',
      address: '123 Main St',
      city: 'Istanbul',
      country: 'Turkey',
      customerType: 'Corporate',
      status: 'Active',
      creditLimit: 50000,
      totalPurchases: 125000,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      companyName: 'Tech Solutions Ltd',
      contactPerson: 'Jane Smith',
      email: 'jane@techsol.com',
      phone: '+90 555 987 6543',
      address: '456 Tech Ave',
      city: 'Ankara',
      country: 'Turkey',
      customerType: 'Corporate',
      status: 'Active',
      creditLimit: 75000,
      totalPurchases: 230000,
      createdAt: '2024-02-20T14:45:00Z',
    },
    {
      id: 3,
      companyName: 'Global Trade Inc',
      contactPerson: 'Ahmed Hassan',
      email: 'ahmed@globaltrade.com',
      phone: '+90 555 456 7890',
      address: '789 Commerce Blvd',
      city: 'Izmir',
      country: 'Turkey',
      customerType: 'Corporate',
      status: 'Potential',
      creditLimit: 100000,
      totalPurchases: 0,
      createdAt: '2024-03-10T09:15:00Z',
    },
  ];

  const columns: ColumnsType<Customer> = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.contactPerson && (
            <div className="text-xs text-gray-500">{record.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.email}</div>
          {record.phone && (
            <div className="text-xs text-gray-500">{record.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div>
          {record.city && <div className="text-sm">{record.city}</div>}
          {record.country && (
            <div className="text-xs text-gray-500">{record.country}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      filters: [
        { text: 'Corporate', value: 'Corporate' },
        { text: 'Individual', value: 'Individual' },
      ],
      onFilter: (value, record) => record.customerType === value,
      render: (type) => (
        <Tag color={type === 'Corporate' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Potential', value: 'Potential' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color =
          status === 'Active'
            ? 'success'
            : status === 'Potential'
            ? 'warning'
            : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Total Purchases',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      sorter: (a, b) => a.totalPurchases - b.totalPurchases,
      render: (value) => `₺${value.toLocaleString('tr-TR')}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
              },
              {
                key: 'edit',
                label: 'Edit',
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Customers
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Customers"
              value={mockCustomers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Customers"
              value={
                mockCustomers.filter((c) => c.status === 'Active').length
              }
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={mockCustomers.reduce((sum, c) => sum + c.totalPurchases, 0)}
              prefix="₺"
              suffix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Space style={{ width: '100%' }} direction="vertical" size="middle">
          <div className="flex gap-4">
            <Input
              placeholder="Search customers by name, email, or phone..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1 }}
              size="large"
              allowClear
            />
            <Button icon={<FilterOutlined />} size="large">
              Filters
            </Button>
          </div>
        </Space>
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={mockCustomers}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: mockCustomers.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} customers`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          loading={false} // TODO: Connect to isLoading from API
        />
      </Card>
    </div>
  );
}
