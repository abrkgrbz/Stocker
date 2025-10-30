'use client';

/**
 * Role Management Page
 * Admin-only page for managing dynamic roles and permissions
 */

import { useState } from 'react';
import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Modal,
  Tooltip,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { RoleModal } from '@/features/roles/components/RoleModal';
import {
  parsePermission,
  getPermissionLabel,
  type Role,
} from '@/lib/api/roles';

const { confirm } = Modal;

export default function RolesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data: roles, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const handleCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    confirm({
      title: 'Rolü Sil',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            <strong>{role.name}</strong> rolünü silmek istediğinizden emin misiniz?
          </p>
          {role.userCount > 0 && (
            <p style={{ color: '#ff4d4f' }}>
              ⚠️ Bu role <strong>{role.userCount} kullanıcı</strong> atanmış.
              Rolü silebilmek için önce kullanıcıları başka bir role atamanız gerekiyor.
            </p>
          )}
        </div>
      ),
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteRoleMutation.mutateAsync(role.id);
      },
    });
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'Rol Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.isSystemRole && (
            <Tooltip title="Sistem rolü - değiştirilemez">
              <LockOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Kullanıcı Sayısı',
      dataIndex: 'userCount',
      key: 'userCount',
      align: 'center',
      width: 150,
      render: (count: number) => (
        <Tag icon={<TeamOutlined />} color={count > 0 ? 'blue' : 'default'}>
          {count} kullanıcı
        </Tag>
      ),
    },
    {
      title: 'Yetki Sayısı',
      key: 'permissionCount',
      align: 'center',
      width: 150,
      render: (_, record: Role) => (
        <Tag color="green">{record.permissions.length} yetki</Tag>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 180,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record: Role) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.isSystemRole}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              disabled={record.isSystemRole}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: Role) => {
    const permissions = record.permissions.map(parsePermission);

    return (
      <Card size="small" title="Yetkiler" bordered={false}>
        <Space wrap>
          {permissions.length > 0 ? (
            permissions.map((perm, index) => (
              <Tag key={index} color="blue">
                {getPermissionLabel(perm)}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#8c8c8c' }}>Yetki bulunmuyor</span>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <AdminOnly
      fallback={
        <Card>
          <Empty
            description="Bu sayfaya erişim yetkiniz yok"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      }
    >
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Rol Yönetimi</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Yeni Rol Oluştur
            </Button>
          }
        >
          <Spin spinning={isLoading}>
            <Table
              columns={columns}
              dataSource={roles || []}
              rowKey="id"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.permissions.length > 0,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} rol`,
              }}
            />
          </Spin>
        </Card>

        <RoleModal
          open={modalOpen}
          role={editingRole}
          onClose={() => {
            setModalOpen(false);
            setEditingRole(null);
          }}
        />
      </div>
    </AdminOnly>
  );
}
