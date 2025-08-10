import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { User } from '@/shared/types';

export const UsersPage: React.FC = () => {
  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'gold' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
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
      title="Users"
      subTitle="Manage system users"
      extra={[
        <Button key="1" type="primary" icon={<PlusOutlined />}>
          New User
        </Button>,
      ]}
    >
      <Card>
        <Table columns={columns} dataSource={[]} />
      </Card>
    </PageContainer>
  );
};