'use client';

/**
 * Edit Role Page
 * Clean SaaS design with module-based permission organization
 * Stripe/Linear inspired - white cards, minimal color accents
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
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LockOutlined,
  WarningOutlined,
  RightOutlined,
  DownOutlined,
  UserOutlined,
  CalendarOutlined,
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

// Module accent colors (only for left border)
const MODULE_ACCENT_COLORS: Record<string, string> = {
  CORE: '#6366f1',      // Indigo
  INVENTORY: '#8b5cf6', // Purple
  SALES: '#10b981',     // Green
  PURCHASE: '#f59e0b',  // Amber
  CRM: '#3b82f6',       // Blue
  HR: '#ec4899',        // Pink
  FINANCE: '#14b8a6',   // Teal
  CMS: '#f97316',       // Orange
};

// Module icons (text-based for cleaner look)
const MODULE_ICONS: Record<string, string> = {
  CORE: '⚙️',
  INVENTORY: '📦',
  SALES: '💰',
  PURCHASE: '🛒',
  CRM: '🤝',
  HR: '👥',
  FINANCE: '📊',
  CMS: '📰',
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
      <div key={resource.value} className="py-2.5 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between mb-1">
          <Checkbox
            checked={hasAll}
            indeterminate={resourcePerms.length > 0 && !hasAll}
            disabled={isSystemRole}
            onChange={(e) => handleToggleAllForResource(resource.value, e.target.checked)}
          >
            <span className="text-slate-700 font-medium text-sm">{resource.label}</span>
          </Checkbox>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 ml-6">
          {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
            const permType = parseInt(type) as PermissionType;
            const isSelected = resourcePerms.some((p) => p.permissionType === permType);

            return (
              <Checkbox
                key={type}
                checked={isSelected}
                disabled={isSystemRole}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleAddPermission(resource.value, permType);
                  } else {
                    handleRemovePermission({ resource: resource.value, permissionType: permType });
                  }
                }}
                className="text-xs"
              >
                <span className="text-slate-500 text-xs">{label}</span>
              </Checkbox>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModuleSection = (
    moduleCode: string,
    moduleName: string,
    resources: ResourceDefinition[],
    isSystemRole: boolean
  ) => {
    const isExpanded = expandedModules.has(moduleCode);
    const permCount = getModulePermissionCount(resources);
    const hasAll = hasAllPermissionsForModule(resources);
    const allTypes = Object.values(PermissionType).filter((v) => typeof v === 'number');
    const maxPerms = resources.length * allTypes.length;
    const accentColor = MODULE_ACCENT_COLORS[moduleCode] || '#6366f1';

    return (
      <div
        key={moduleCode}
        className="bg-white rounded-lg border border-gray-200 shadow-sm mb-3 overflow-hidden"
      >
        {/* Module Header */}
        <div
          className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleModule(moduleCode)}
          style={{ borderLeft: `4px solid ${accentColor}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{MODULE_ICONS[moduleCode]}</span>
              <div>
                <span className="text-slate-900 font-semibold">{moduleName}</span>
                <span className="text-slate-400 text-sm ml-2">({resources.length} kaynak)</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox
                checked={hasAll}
                indeterminate={permCount > 0 && !hasAll}
                disabled={isSystemRole}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleAllForModule(moduleCode, resources, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-right min-w-[60px]">
                <span className="text-slate-900 font-semibold">{permCount}</span>
                <span className="text-slate-400">/{maxPerms}</span>
              </div>
              {isExpanded ? (
                <DownOutlined className="text-slate-400 text-xs" />
              ) : (
                <RightOutlined className="text-slate-400 text-xs" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-3 border-t border-gray-100">
            {resources.map(resource => renderResourcePermissions(resource, isSystemRole))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
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
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header */}
      <div className="sticky top-0 z-50 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 m-0">
                Rol Düzenle
              </h1>
              <p className="text-sm text-slate-500 m-0">{role.name}</p>
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
              className={isSystemRole ? '' : 'bg-slate-900 hover:bg-slate-800 border-slate-900'}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* System Role Warning */}
      {isSystemRole && (
        <div className="px-6 pt-4 max-w-6xl mx-auto">
          <Alert
            message="Sistem Rolü"
            description="Bu rol sistem tarafından oluşturulmuştur ve düzenlenemez. Sadece görüntüleyebilirsiniz."
            type="warning"
            showIcon
            icon={<LockOutlined />}
            className="border-amber-200 bg-amber-50"
          />
        </div>
      )}

      {/* Page Content */}
      <div className="px-6 py-6 max-w-6xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={updateMutation.isPending || isSystemRole}
        >
          <Row gutter={24}>
            {/* Left Panel - Form & Info (30%) */}
            <Col xs={24} lg={8}>
              {/* Role Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Rol Bilgileri</h3>

                <Form.Item
                  name="name"
                  label={<span className="text-slate-700">Rol Adı</span>}
                  rules={[
                    { required: true, message: 'Rol adı zorunludur' },
                    { min: 2, message: 'En az 2 karakter' },
                  ]}
                >
                  <Input
                    placeholder="örn: Satış Yöneticisi"
                    size="large"
                    disabled={isSystemRole}
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-slate-700">Açıklama</span>}
                >
                  <Input.TextArea
                    placeholder="Rolün görev ve sorumluluklarını açıklayın..."
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    disabled={isSystemRole}
                    className="rounded-md"
                  />
                </Form.Item>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Özet</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Toplam Yetki</span>
                    <span className="text-slate-900 font-semibold text-lg">{selectedPermissions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Aktif Modül</span>
                    <span className="text-slate-900 font-semibold text-lg">{moduleResources.length + 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Kullanıcı Sayısı</span>
                    <span className="text-slate-900 font-semibold text-lg">{role.userCount || 0}</span>
                  </div>
                  {modulesData?.packageName && (
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-slate-600">Paket</span>
                      <span className="text-slate-900 font-medium">{modulesData.packageName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Meta Info */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Detaylar</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <UserOutlined className="text-slate-400" />
                    <span className="text-slate-600">Atanan Kullanıcı:</span>
                    <span className="text-slate-900 font-medium">{role.userCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-slate-600">Oluşturulma:</span>
                    <span className="text-slate-900 font-medium">
                      {role.createdDate ? new Date(role.createdDate).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                  {isSystemRole && (
                    <div className="flex items-center gap-3 text-sm">
                      <LockOutlined className="text-amber-500" />
                      <span className="text-amber-600 font-medium">Sistem Rolü</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Permissions */}
              {selectedPermissions.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Mevcut Yetkiler</h3>
                    <Badge count={selectedPermissions.length} style={{ backgroundColor: '#334155' }} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {selectedPermissions.slice(0, 12).map((perm, index) => {
                        const allResources = [...CORE_RESOURCES, ...MODULE_RESOURCES.flatMap(m => m.resources)];
                        const resource = allResources.find((r) => r.value === perm.resource);
                        return (
                          <Tag
                            key={index}
                            closable={!isSystemRole}
                            onClose={() => handleRemovePermission(perm)}
                            className="text-xs bg-slate-100 border-slate-200 text-slate-700"
                          >
                            {resource?.label} - {PERMISSION_TYPE_LABELS[perm.permissionType as PermissionType]}
                          </Tag>
                        );
                      })}
                      {selectedPermissions.length > 12 && (
                        <Tag className="text-xs bg-slate-50 border-slate-200 text-slate-500">
                          +{selectedPermissions.length - 12} daha
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Col>

            {/* Right Panel - Permissions (70%) */}
            <Col xs={24} lg={16}>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Yetkiler</h2>
                  <span className="text-xs text-slate-500">
                    Modüle tıklayarak kaynakları görüntüleyin
                  </span>
                </div>
              </div>

              {selectedPermissions.length === 0 && (
                <Alert
                  message="Henüz yetki atanmamış"
                  description="Bu rol için en az bir yetki seçmelisiniz."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  className="mb-4 border-amber-200 bg-amber-50"
                />
              )}

              {/* Core Resources */}
              {renderModuleSection('CORE', 'Sistem Yönetimi', coreResources, isSystemRole)}

              {/* Module Resources */}
              {moduleResources.map((module) =>
                renderModuleSection(
                  module.moduleCode,
                  module.moduleName,
                  module.resources,
                  isSystemRole
                )
              )}

              {/* No modules message */}
              {moduleResources.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <Text className="text-slate-500">
                    Aboneliğinize dahil ek modül bulunmuyor.
                  </Text>
                </div>
              )}
            </Col>
          </Row>

          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
