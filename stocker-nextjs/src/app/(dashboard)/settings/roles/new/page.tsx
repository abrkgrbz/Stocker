'use client';

/**
 * New Role Page
 * Modern full-page layout for creating roles (CRM Customer style)
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
  Input,
  Space,
  Row,
  Col,
  Typography,
  Checkbox,
  Badge,
  Tag,
  Collapse,
  Alert,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  DownOutlined,
  RightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useCreateRole, useRoles } from '@/hooks/useRoles';
import {
  AVAILABLE_RESOURCES,
  PERMISSION_TYPE_LABELS,
  PermissionType,
  formatPermission,
  type Permission,
} from '@/lib/api/roles';

const { Text } = Typography;
const { Panel } = Collapse;

// Resource icon mapping
const getResourceIcon = (resourceValue: string): string => {
  if (resourceValue.startsWith('CRM.')) return '💼';
  const iconMap: Record<string, string> = {
    'Users': '👥',
    'Roles': '🔐',
    'Tenants': '🏢',
    'Modules': '🧩',
    'Settings': '⚙️',
    'Reports': '📊',
    'Integrations': '🔌',
    'Billing': '💳',
    'Security': '🛡️',
    'Audit': '📋',
  };
  return iconMap[resourceValue] || '📦';
};

// Get color based on permission count
const getPermissionColor = (count: number): string => {
  if (count >= 50) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (count >= 20) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  if (count >= 10) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
};

export default function NewRolePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [copyFromRoleId, setCopyFromRoleId] = useState<string | undefined>(undefined);

  const createMutation = useCreateRole();
  const { data: allRoles } = useRoles();

  const handleSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description,
        permissions: selectedPermissions,
      });
      router.push('/settings/roles');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCopyFromRole = (roleId: string | undefined) => {
    setCopyFromRoleId(roleId);
    if (roleId) {
      const selectedRole = allRoles?.find((r) => r.id === roleId);
      if (selectedRole) {
        setSelectedPermissions(selectedRole.permissions.map((p) => {
          const [resource, type] = p.split('.');
          return { resource, permissionType: parseInt(type) as PermissionType };
        }));
      }
    }
  };

  const handleAddPermission = (resource: string, permissionType: PermissionType) => {
    const newPermission: Permission = { resource, permissionType };
    const permissionStr = formatPermission(newPermission);
    const exists = selectedPermissions.some((p) => formatPermission(p) === permissionStr);
    if (!exists) {
      setSelectedPermissions([...selectedPermissions, newPermission]);
    }
  };

  const handleRemovePermission = (permission: Permission) => {
    setSelectedPermissions(
      selectedPermissions.filter((p) => formatPermission(p) !== formatPermission(permission))
    );
  };

  const handleToggleAllPermissionsForResource = (resource: string, checked: boolean) => {
    if (checked) {
      const newPermissions = Object.values(PermissionType)
        .filter((v) => typeof v === 'number')
        .map((type) => ({ resource, permissionType: type as PermissionType }));
      const existingPermStrs = selectedPermissions.map(formatPermission);
      const toAdd = newPermissions.filter((p) => !existingPermStrs.includes(formatPermission(p)));
      setSelectedPermissions([...selectedPermissions, ...toAdd]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p.resource !== resource));
    }
  };

  const getResourcePermissions = (resource: string) => {
    return selectedPermissions.filter((p) => p.resource === resource);
  };

  const hasAllPermissionsForResource = (resource: string) => {
    const resourcePerms = getResourcePermissions(resource);
    const allTypes = Object.values(PermissionType).filter((v) => typeof v === 'number');
    return resourcePerms.length === allTypes.length;
  };

  const groupedPermissions = AVAILABLE_RESOURCES.map((res) => ({
    ...res,
    permissions: getResourcePermissions(res.value),
    hasAll: hasAllPermissionsForResource(res.value),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Rol
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir rol oluşturun ve yetkilerini belirleyin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/settings/roles')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Row gutter={48}>
            {/* Left Panel - Visual & Stats (40%) */}
            <Col xs={24} lg={10}>
              {/* Role Visual Card */}
              <div className="mb-8">
                <div
                  style={{
                    background: getPermissionColor(selectedPermissions.length),
                    borderRadius: '16px',
                    padding: '40px 20px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SafetyOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">
                    {selectedPermissions.length >= 50 ? 'Süper Admin' :
                     selectedPermissions.length >= 20 ? 'Yönetici' :
                     selectedPermissions.length >= 10 ? 'Moderatör' : 'Standart Rol'}
                  </p>
                  <p className="text-sm text-white/60">
                    {selectedPermissions.length} yetki seçildi
                  </p>
                </div>
              </div>

              {/* Permission Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-100">
                  <div className="text-2xl font-semibold text-blue-600">
                    {selectedPermissions.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Toplam Yetki</div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-xl text-center border border-green-100">
                  <div className="text-2xl font-semibold text-green-600">
                    {groupedPermissions.filter(g => g.permissions.length > 0).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Aktif Kaynak</div>
                </div>
              </div>

              {/* Copy from existing role */}
              {allRoles && allRoles.length > 0 && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    Mevcut Rolden Kopyala
                  </Text>
                  <Select
                    placeholder="Bir rol seçin (isteğe bağlı)"
                    allowClear
                    style={{ width: '100%' }}
                    size="large"
                    value={copyFromRoleId}
                    onChange={handleCopyFromRole}
                    options={allRoles
                      .filter((r) => !r.isSystemRole)
                      .map((r) => ({
                        label: `${r.name} (${r.permissions.length} yetki)`,
                        value: r.id,
                      }))}
                  />
                </div>
              )}

              {/* Selected Permissions Summary */}
              {selectedPermissions.length > 0 && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    <CheckCircleOutlined className="mr-1" /> Seçilen Yetkiler
                  </Text>
                  <div className="p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedPermissions.slice(0, 20).map((perm, index) => {
                        const resource = AVAILABLE_RESOURCES.find((r) => r.value === perm.resource);
                        return (
                          <Tag
                            key={index}
                            closable
                            onClose={() => handleRemovePermission(perm)}
                            color="blue"
                            className="mb-1"
                          >
                            {resource?.label} - {(PERMISSION_TYPE_LABELS as any)[perm.permissionType]}
                          </Tag>
                        );
                      })}
                      {selectedPermissions.length > 20 && (
                        <Tag color="default">+{selectedPermissions.length - 20} daha</Tag>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Role Name - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Rol adı zorunludur' },
                    { min: 2, message: 'En az 2 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Rol Adı"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
                <Form.Item name="description" className="mb-0 mt-2">
                  <Input.TextArea
                    placeholder="Rolün görev ve sorumluluklarını açıklayın..."
                    variant="borderless"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{
                      fontSize: '15px',
                      padding: '0',
                      color: '#666',
                      resize: 'none'
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Permissions Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <LockOutlined className="mr-1" /> Yetkiler
                </Text>

                {selectedPermissions.length === 0 && (
                  <Alert
                    message="Henüz yetki seçilmedi"
                    description="Bu rol için en az bir yetki seçmelisiniz. Aşağıdaki kaynaklardan yetkileri seçerek başlayın."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    className="mb-4"
                    style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}
                  />
                )}

                <Collapse
                  defaultActiveKey={[]}
                  accordion
                  ghost
                  expandIcon={({ isActive }) => (
                    isActive ? <DownOutlined className="text-gray-400" /> : <RightOutlined className="text-gray-400" />
                  )}
                  className="permission-collapse"
                >
                  {groupedPermissions.map((resource) => (
                    <Panel
                      key={resource.value}
                      header={
                        <div className="flex justify-between items-center w-full py-1">
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: 24 }}>
                              {getResourceIcon(resource.value)}
                            </span>
                            <Checkbox
                              checked={resource.hasAll}
                              indeterminate={resource.permissions.length > 0 && !resource.hasAll}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleAllPermissionsForResource(resource.value, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="font-medium text-gray-800">{resource.label}</span>
                            </Checkbox>
                          </div>
                          {resource.permissions.length > 0 && (
                            <Badge
                              count={resource.permissions.length}
                              style={{
                                backgroundColor: resource.hasAll ? '#52c41a' : '#1890ff',
                                marginRight: 8
                              }}
                            />
                          )}
                        </div>
                      }
                      className="mb-2 bg-gray-50/50 rounded-lg overflow-hidden border-0"
                    >
                      <div className="px-4 py-3 bg-white rounded-lg mx-2 mb-2">
                        <Row gutter={[12, 12]}>
                          {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
                            const permType = parseInt(type) as PermissionType;
                            const isSelected = resource.permissions.some((p) => p.permissionType === permType);

                            return (
                              <Col span={12} key={type}>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleAddPermission(resource.value, permType);
                                    } else {
                                      handleRemovePermission({
                                        resource: resource.value,
                                        permissionType: permType,
                                      });
                                    }
                                  }}
                                  className="w-full"
                                >
                                  <span className="text-sm text-gray-700">{label}</span>
                                </Checkbox>
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
