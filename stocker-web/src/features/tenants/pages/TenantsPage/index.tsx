import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Tenant } from '@/shared/types';

export const TenantsPage: React.FC = () => {
  const columns: ColumnsType<Tenant> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Contact',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
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
      title="Tenants"
      subTitle="Manage system tenants"
      extra={[
        <Button key="1" type="primary" icon={<PlusOutlined />}>
          New Tenant
        </Button>,
      ]}
    >
      <Card>
        <Table columns={columns} dataSource={[]} />
      </Card>
    </PageContainer>
  );
};