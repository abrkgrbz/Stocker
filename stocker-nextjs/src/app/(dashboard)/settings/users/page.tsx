'use client';

/**
 * User Management Page
 * Manage tenant users, roles, and permissions
 */

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Avatar,
  Tooltip,
  Badge,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AdminOnly } from '@/components/auth/PermissionGate';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
  createdAt: string;
}

// Mock data - gerçek API'den gelecek
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'FirmaYöneticisi',
    isActive: true,
    phone: '+90 555 123 4567',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Yönetici',
    lastName: 'Kullanıcı',
    role: 'Yönetici',
    isActive: true,
    createdAt: '2024-02-20T14:20:00Z',
  },
];

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<User> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              @{record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MailOutlined style={{ color: '#8c8c8c' }} />
            <span style={{ fontSize: 13 }}>{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2">
              <PhoneOutlined style={{ color: '#8c8c8c' }} />
              <span style={{ fontSize: 13 }}>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color =
          role === 'FirmaYöneticisi' ? 'red' : role === 'Yönetici' ? 'blue' : 'default';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      align: 'center',
      width: 120,
      render: (isActive: boolean) =>
        isActive ? (
          <Badge status="success" text="Aktif" />
        ) : (
          <Badge status="error" text="Pasif" />
        ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <AdminOnly>
          <Space>
            <Tooltip title="Düzenle">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => message.info('Düzenleme özelliği yakında...')}
              />
            </Tooltip>
            <Tooltip title="Sil">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.role === 'FirmaYöneticisi'}
                onClick={() => message.info('Silme özelliği yakında...')}
              />
            </Tooltip>
          </Space>
        </AdminOnly>
      ),
    },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>Kullanıcı Yönetimi</span>
          </div>
        }
        extra={
          <Space>
            <Input
              placeholder="Kullanıcı ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <AdminOnly>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => message.info('Kullanıcı ekleme özelliği yakında...')}
              >
                Yeni Kullanıcı
              </Button>
            </AdminOnly>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kullanıcı`,
          }}
        />
      </Card>
    </div>
  );
}
