'use client';

/**
 * Role Management Page - Compact List Layout
 * Search-focused, scalable role management interface
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Tag,
  Space,
  Modal,
  Tooltip,
  Empty,
  Spin,
  Row,
  Col,
  Typography,
  Dropdown,
  Divider,
  Input,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { RoleModal } from '@/features/roles/components/RoleModal';
import { RoleDetailsDrawer } from '@/features/roles/components/RoleDetailsDrawer';
import {
  parsePermission,
  getPermissionLabel,
  type Role,
} from '@/lib/api/roles';

const { confirm } = Modal;
const { Title, Text } = Typography;

export default function RolesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: roles, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery.trim()) return roles;

    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        (role.isSystemRole && 'sistem'.includes(query))
    );
  }, [roles, searchQuery]);

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role);
    setDetailsDrawerOpen(true);
  };

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

  const getRoleIcon = (role: Role) => {
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  const getMenuItems = (role: Role) => [
    {
      key: 'view',
      label: 'Detayları Görüntüle',
      onClick: () => handleViewDetails(role),
    },
    {
      type: 'divider',
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      disabled: role.isSystemRole,
      onClick: () => handleEdit(role),
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      disabled: role.isSystemRole,
      onClick: () => handleDelete(role),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              <SafetyOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Rol Yönetimi
            </Title>
            <Text type="secondary">
              Sistemdeki rolleri yönetin ve yetkileri düzenleyin
            </Text>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  TOPLAM ROL
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  AKTİF KULLANICI
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.reduce((sum, r) => sum + r.userCount, 0) || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  SİSTEM ROLÜ
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.filter((r) => r.isSystemRole).length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#fff0f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ÖZEL ROL
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.filter((r) => !r.isSystemRole).length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search Bar + Create Button */}
      <Card style={{ marginBottom: 24 }} bordered={false}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            size="large"
            placeholder="Rolleri ara... (rol adı, açıklama, durum)"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ flex: 1, minWidth: 300 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ minWidth: 160 }}
          >
            Yeni Rol Oluştur
          </Button>
        </div>
      </Card>

      {/* Roles List */}
      <Spin spinning={isLoading}>
        {filteredRoles && filteredRoles.length > 0 ? (
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 16 }}>
                  Roller ({filteredRoles.length})
                </Text>
              </div>
            }
          >
            <div className="space-y-0">
              {filteredRoles.map((role, index) => (
                <div key={role.id}>
                  {index > 0 && <Divider style={{ margin: 0 }} />}
                  <div
                    className="hover:bg-gray-50 transition-all duration-200"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleViewDetails(role)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      {/* Icon */}
                      <div
                        style={{
                          fontSize: 32,
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f0f5ff',
                          borderRadius: 8,
                        }}
                      >
                        {getRoleIcon(role)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 16 }}>
                            {role.name}
                          </Text>
                          {role.isSystemRole && (
                            <Tag icon={<LockOutlined />} color="warning">
                              Sistem Rolü
                            </Tag>
                          )}
                        </div>

                        {/* Description */}
                        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                          {role.description || 'Açıklama bulunmuyor'}
                        </Text>

                        {/* Stats */}
                        <Space size="large">
                          <Space size="small">
                            <TeamOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Kullanıcılar: <Text strong>{role.userCount}</Text>
                            </Text>
                          </Space>
                          <Space size="small">
                            <SafetyOutlined style={{ color: '#52c41a' }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Yetkiler: <Text strong>{role.permissions.length}</Text>
                            </Text>
                          </Space>
                          <Space size="small">
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Oluşturulma: {new Date(role.createdDate).toLocaleDateString('tr-TR')}
                            </Text>
                          </Space>
                        </Space>
                      </div>

                      {/* Actions */}
                      <Space size="small">
                        <Tooltip title="Düzenle">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(role);
                            }}
                            disabled={role.isSystemRole}
                          />
                        </Tooltip>
                        <Tooltip title="Sil">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(role);
                            }}
                            disabled={role.isSystemRole}
                          />
                        </Tooltip>
                        <Dropdown menu={{ items: getMenuItems(role) }} trigger={['click']}>
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </Space>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : searchQuery ? (
          <Card>
            <Empty
              image={<SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Sonuç Bulunamadı
                  </Text>
                  <Text type="secondary">
                    "{searchQuery}" için eşleşen rol bulunamadı
                  </Text>
                </div>
              }
            />
          </Card>
        ) : (
          <Card>
            <Empty description="Henüz rol oluşturulmamış" />
          </Card>
        )}
      </Spin>

      <RoleModal
        open={modalOpen}
        role={editingRole}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
      />

      <RoleDetailsDrawer
        role={selectedRole}
        open={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
}
