'use client';

/**
 * Edit Role Page
 * Modern full-page layout with module-based permission organization
 * Only shows resources for modules the tenant has access to
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Alert,
  Skeleton,
  Spin,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useRole, useUpdateRole } from '@/hooks/useRoles';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import {
  CORE_RESOURCES,
  MODULE_RESOURCES,
  PERMISSION_TYPE_LABELS,
  PermissionType,
  formatPermission,
  parsePermission,
  getAvailableResourcesForModules,
  type Permission,
  type ResourceDefinition,
} from '@/lib/api/roles';

const { Text } = Typography;

// Get color based on permission count
const getPermissionColor = (count: number): string => {
  if (count >= 50) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (count >= 20) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  if (count >= 10) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
};

// Permission type icons
const PERMISSION_TYPE_ICONS: Record<PermissionType, string> = {
  [PermissionType.View]: '👁️',
  [PermissionType.Create]: '➕',
  [PermissionType.Edit]: '✏️',
  [PermissionType.Delete]: '🗑️',
  [PermissionType.Export]: '📤',
  [PermissionType.Import]: '📥',
  [PermissionType.Approve]: '✅',
  [PermissionType.Execute]: '▶️',
};

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['CORE']));

  const { data: role, isLoading } = useRole(roleId);
  const updateMutation = useUpdateRole();
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  // Get available resources based on tenant's active modules
  const { coreResources, moduleResources } = useMemo(() => {
    if (!modulesData?.modules) {
      return { coreResources: CORE_RESOURCES, moduleResources: [] };
    }
    const activeCodes = modulesData.modules
      .filter(m => m.isActive)
      .map(m => m.code);
    return getAvailableResourcesForModules(activeCodes);
  }, [modulesData]);

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
      });
      setSelectedPermissions(role.permissions.map(parsePermission));
    }
  }, [role, form]);

  const handleSubmit = async (values: any) => {
    try {
      await updateMutation.mutateAsync({
        roleId,
        data: {
          name: values.name,
          description: values.description,
          permissions: selectedPermissions,
        },
      });
      router.push('/settings/roles');
    } catch (error) {
      // Error handled by hook
    }
  };

  const toggleModule = (moduleCode: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleCode)) {
      newExpanded.delete(moduleCode);
    } else {
      newExpanded.add(moduleCode);
    }
    setExpandedModules(newExpanded);
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

  const handleToggleAllForResource = (resource: string, checked: boolean) => {
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

  const handleToggleAllForModule = (moduleCode: string, resources: ResourceDefinition[], checked: boolean) => {
    if (checked) {
      const newPermissions: Permission[] = [];
      resources.forEach(res => {
        Object.values(PermissionType)
          .filter((v) => typeof v === 'number')
          .forEach((type) => {
            newPermissions.push({ resource: res.value, permissionType: type as PermissionType });
          });
      });
      const existingPermStrs = selectedPermissions.map(formatPermission);
      const toAdd = newPermissions.filter((p) => !existingPermStrs.includes(formatPermission(p)));
      setSelectedPermissions([...selectedPermissions, ...toAdd]);
    } else {
      const resourceValues = new Set(resources.map(r => r.value));
      setSelectedPermissions(selectedPermissions.filter((p) => !resourceValues.has(p.resource)));
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

  const getModulePermissionCount = (resources: ResourceDefinition[]) => {
    const resourceValues = new Set(resources.map(r => r.value));
    return selectedPermissions.filter(p => resourceValues.has(p.resource)).length;
  };

  const hasAllPermissionsForModule = (resources: ResourceDefinition[]) => {
    const allTypes = Object.values(PermissionType).filter((v) => typeof v === 'number');
    const maxPerms = resources.length * allTypes.length;
    return getModulePermissionCount(resources) === maxPerms;
  };

  const renderResourcePermissions = (resource: ResourceDefinition, isSystemRole: boolean) => {
    const resourcePerms = getResourcePermissions(resource.value);
    const hasAll = hasAllPermissionsForResource(resource.value);

    return (
      <div key={resource.value} className="p-3 bg-white rounded-lg border border-gray-100 mb-2">
        <div className="flex items-center justify-between mb-2">
          <Checkbox
            checked={hasAll}
            indeterminate={resourcePerms.length > 0 && !hasAll}
            disabled={isSystemRole}
            onChange={(e) => handleToggleAllForResource(resource.value, e.target.checked)}
          >
            <span className="font-medium text-gray-800">{resource.label}</span>
          </Checkbox>
          {resourcePerms.length > 0 && (
            <Badge
              count={resourcePerms.length}
              style={{ backgroundColor: hasAll ? '#52c41a' : '#1890ff' }}
              size="small"
            />
          )}
        </div>
        <div className="flex flex-wrap gap-1 ml-6">
          {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
            const permType = parseInt(type) as PermissionType;
            const isSelected = resourcePerms.some((p) => p.permissionType === permType);

            return (
              <Tooltip key={type} title={label}>
                <button
                  type="button"
                  disabled={isSystemRole}
                  onClick={() => {
                    if (isSelected) {
                      handleRemovePermission({ resource: resource.value, permissionType: permType });
                    } else {
                      handleAddPermission(resource.value, permType);
                    }
                  }}
                  className={`
                    px-2 py-1 text-xs rounded-md transition-all duration-200
                    ${isSystemRole ? 'cursor-not-allowed opacity-60' : ''}
                    ${isSelected
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span className="mr-1">{PERMISSION_TYPE_ICONS[permType]}</span>
                  {label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModuleSection = (
    moduleCode: string,
    moduleName: string,
    icon: string,
    color: string,
    resources: ResourceDefinition[],
    isSystemRole: boolean
  ) => {
    const isExpanded = expandedModules.has(moduleCode);
    const permCount = getModulePermissionCount(resources);
    const hasAll = hasAllPermissionsForModule(resources);
    const allTypes = Object.values(PermissionType).filter((v) => typeof v === 'number');
    const maxPerms = resources.length * allTypes.length;

    return (
      <div key={moduleCode} className="mb-4">
        <div
          className="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
          style={{ background: color }}
          onClick={() => toggleModule(moduleCode)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="font-semibold text-white">{moduleName}</div>
                <div className="text-xs text-white/70">{resources.length} kaynak</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={hasAll}
                indeterminate={permCount > 0 && !hasAll}
                disabled={isSystemRole}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleAllForModule(moduleCode, resources, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="permission-checkbox-white"
              />
              <div className="text-right">
                <div className="text-lg font-bold text-white">{permCount}</div>
                <div className="text-xs text-white/70">/ {maxPerms}</div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl">
            {resources.map(resource => renderResourcePermissions(resource, isSystemRole))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Alert
          message="Rol bulunamadı"
          description="İstenen rol sistemde bulunamadı."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const isSystemRole = role.isSystemRole;

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
                Rol Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{role.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/settings/roles')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateMutation.isPending}
              onClick={() => form.submit()}
              disabled={isSystemRole}
              style={{
                background: isSystemRole ? undefined : '#1a1a1a',
                borderColor: isSystemRole ? undefined : '#1a1a1a',
              }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* System Role Warning */}
      {isSystemRole && (
        <div className="px-8 pt-4 max-w-7xl mx-auto">
          <Alert
            message="Sistem Rolü"
            description="Bu rol sistem tarafından oluşturulmuştur ve düzenlenemez. Sadece görüntüleyebilirsiniz."
            type="warning"
            showIcon
            icon={<LockOutlined />}
          />
        </div>
      )}

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={updateMutation.isPending || isSystemRole}
        >
          <Row gutter={48}>
            {/* Left Panel - Visual & Stats (35%) */}
            <Col xs={24} lg={8}>
              {/* Role Visual Card */}
              <div className="mb-6">
                <div
                  style={{
                    background: isSystemRole
                      ? 'linear-gradient(135deg, #ffa940 0%, #fa8c16 100%)'
                      : getPermissionColor(selectedPermissions.length),
                    borderRadius: '16px',
                    padding: '32px 20px',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSystemRole ? (
                    <LockOutlined style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                  ) : (
                    <SafetyOutlined style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                  )}
                  <p className="mt-3 text-base font-medium text-white/90">
                    {isSystemRole ? 'Sistem Rolü' :
                     selectedPermissions.length >= 50 ? 'Süper Admin' :
                     selectedPermissions.length >= 20 ? 'Yönetici' :
                     selectedPermissions.length >= 10 ? 'Moderatör' : 'Standart Rol'}
                  </p>
                  <p className="text-sm text-white/60">
                    {selectedPermissions.length} yetki atanmış
                  </p>
                </div>
              </div>

              {/* Role Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-100">
                  <div className="text-2xl font-semibold text-blue-600">
                    {selectedPermissions.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Toplam Yetki</div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-xl text-center border border-green-100">
                  <div className="text-2xl font-semibold text-green-600">
                    {role.userCount || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Kullanıcı</div>
                </div>
              </div>

              {/* Role Info */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-gray-50/50 rounded-lg flex items-center gap-3">
                  <TeamOutlined className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Atanan Kullanıcı</div>
                    <div className="font-medium">{role.userCount || 0} kullanıcı</div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-lg flex items-center gap-3">
                  <CalendarOutlined className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Oluşturulma Tarihi</div>
                    <div className="font-medium">
                      {role.createdDate ? new Date(role.createdDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Permissions Summary */}
              {selectedPermissions.length > 0 && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    <CheckCircleOutlined className="mr-1" /> Mevcut Yetkiler
                  </Text>
                  <div className="p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {selectedPermissions.slice(0, 15).map((perm, index) => {
                        const allResources = [...CORE_RESOURCES, ...MODULE_RESOURCES.flatMap(m => m.resources)];
                        const resource = allResources.find((r) => r.value === perm.resource);
                        return (
                          <Tag
                            key={index}
                            closable={!isSystemRole}
                            onClose={() => handleRemovePermission(perm)}
                            color="blue"
                            className="mb-1 text-xs"
                          >
                            {resource?.label} - {PERMISSION_TYPE_LABELS[perm.permissionType as PermissionType]}
                          </Tag>
                        );
                      })}
                      {selectedPermissions.length > 15 && (
                        <Tag color="default">+{selectedPermissions.length - 15} daha</Tag>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Module Info */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                  <InfoCircleOutlined className="text-amber-500 mt-0.5" />
                  <div>
                    <Text className="font-medium text-amber-800 block text-sm">Modül Bilgisi</Text>
                    <Text className="text-xs text-amber-700">
                      Sadece aboneliğinize dahil modüller için yetki atayabilirsiniz.
                      {modulesData?.packageName && (
                        <span className="block mt-1 font-medium">
                          Paket: {modulesData.packageName}
                        </span>
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Panel - Form Content (65%) */}
            <Col xs={24} lg={16}>
              {/* Role Name - Hero Input */}
              <div className="mb-6">
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
                    disabled={isSystemRole}
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
                    disabled={isSystemRole}
                    autoSize={{ minRows: 2, maxRows: 3 }}
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
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-6" />

              {/* Permissions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <LockOutlined className="mr-1" /> Yetkiler
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Modüle tıklayarak kaynakları görüntüleyin
                  </Text>
                </div>

                {selectedPermissions.length === 0 && (
                  <Alert
                    message="Henüz yetki atanmamış"
                    description="Bu rol için en az bir yetki seçmelisiniz."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    className="mb-4"
                    style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}
                  />
                )}

                {/* Core Resources */}
                {renderModuleSection(
                  'CORE',
                  'Sistem Yönetimi',
                  '⚙️',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  coreResources,
                  isSystemRole
                )}

                {/* Module Resources */}
                {moduleResources.map((module) =>
                  renderModuleSection(
                    module.moduleCode,
                    module.moduleName,
                    module.icon,
                    module.color,
                    module.resources,
                    isSystemRole
                  )
                )}

                {/* No modules message */}
                {moduleResources.length === 0 && (
                  <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <Text className="text-gray-500">
                      Aboneliğinize dahil ek modül bulunmuyor.
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>

      {/* Custom styles for white checkbox */}
      <style jsx global>{`
        .permission-checkbox-white .ant-checkbox-inner {
          background-color: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.6);
        }
        .permission-checkbox-white .ant-checkbox-checked .ant-checkbox-inner {
          background-color: white;
          border-color: white;
        }
        .permission-checkbox-white .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #667eea;
        }
        .permission-checkbox-white .ant-checkbox-indeterminate .ant-checkbox-inner::after {
          background-color: white;
        }
      `}</style>
    </div>
  );
}
