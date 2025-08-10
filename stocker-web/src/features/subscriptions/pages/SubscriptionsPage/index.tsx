import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Subscription } from '@/shared/types';

export const SubscriptionsPage: React.FC = () => {
  const columns: ColumnsType<Subscription> = [
    {
      title: 'Subscription #',
      dataIndex: 'subscriptionNumber',
      key: 'subscriptionNumber',
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Package',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          Active: 'green',
          Trial: 'blue',
          Suspended: 'orange',
          Cancelled: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => `${record.currency} ${record.price}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} />
          <Button type="link" danger icon={<StopOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Subscriptions"
      subTitle="Manage tenant subscriptions"
      extra={[
        <Button key="1" type="primary" icon={<PlusOutlined />}>
          New Subscription
        </Button>,
      ]}
    >
      <Card>
        <Table columns={columns} dataSource={[]} />
      </Card>
    </PageContainer>
  );
};