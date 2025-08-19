import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Package } from '@/shared/types';

export const PackagesPage: React.FC = () => {
  const columns: ColumnsType<Package> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => `${record.currency} ${record.basePrice}`,
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
    },
    {
      title: 'Max Users',
      dataIndex: 'maxUsers',
      key: 'maxUsers',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} />
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Packages"
      subTitle="Manage subscription packages"
      extra={[
        <Button key="1" type="primary" icon={<PlusOutlined />}>
          New Package
        </Button>,
      ]}
    >
      <Card>
        <Table columns={columns} dataSource={[]} />
      </Card>
    </PageContainer>
  );
};