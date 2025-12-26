'use client';

/**
 * New Role Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked list layouts for permissions
 * - Sticky action bar at bottom
 * - Minimal accent colors (only on icons/critical elements)
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Checkbox } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useCreateRole, useRoles } from '@/hooks/useRoles';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import {
  CORE_RESOURCES,
  MODULE_RESOURCES,
  PERMISSION_TYPE_LABELS,
  PermissionType,
  formatPermission,
  getAvailableResourcesForModules,
  type Permission,
  type ResourceDefinition,
} from '@/lib/api/roles';

// Subtle accent colors for module icons only
const MODULE_ICON_COLORS: Record<string, string> = {
  CORE: '#6366f1',
  INVENTORY: '#8b5cf6',
  SALES: '#10b981',
  PURCHASE: '#f59e0b',
  CRM: '#3b82f6',
  HR: '#ec4899',
  FINANCE: '#14b8a6',
  CMS: '#f97316',
};

export default function NewRolePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [copyFromRoleId, setCopyFromRoleId] = useState<string | undefined>(undefined);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['CORE']));

  const createMutation = useCreateRole();
  const { data: allRoles } = useRoles();
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  const { coreResources, moduleResources } = useMemo(() => {
    if (!modulesData?.modules) {
      return { coreResources: CORE_RESOURCES, moduleResources: [] };
    }
    const activeCodes = modulesData.modules
      .filter(m => m.isActive)
      .map(m => m.code);
    return getAvailableResourcesForModules(activeCodes);
  }, [modulesData]);

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
        const permissions = selectedRole.permissions.map((p) => {
          const [resource, type] = p.split(':');
          return { resource, permissionType: parseInt(type) as PermissionType };
        });
        setSelectedPermissions(permissions);
      }
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

  const handleToggleAllForModule = (resources: ResourceDefinition[], checked: boolean) => {
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

  // Stacked list item for each resource
  const renderResourceRow = (resource: ResourceDefinition) => {
    const resourcePerms = getResourcePermissions(resource.value);
    const hasAll = hasAllPermissionsForResource(resource.value);

    return (
      <div
        key={resource.value}
        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0"
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={hasAll}
            indeterminate={resourcePerms.length > 0 && !hasAll}
            onChange={(e) => handleToggleAllForResource(resource.value, e.target.checked)}
          />
          <span className="text-sm text-slate-700">{resource.label}</span>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
            const permType = parseInt(type) as PermissionType;
            const isSelected = resourcePerms.some((p) => p.permissionType === permType);

            return (
              <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleAddPermission(resource.value, permType);
                    } else {
                      handleRemovePermission({ resource: resource.value, permissionType: permType });
                    }
                  }}
                  className="[&_.ant-checkbox-inner]:w-4 [&_.ant-checkbox-inner]:h-4"
                />
                <span className="text-xs text-slate-500">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Module section with stacked list
  const renderModuleSection = (
    moduleCode: string,
    moduleName: string,
    resources: ResourceDefinition[]
  ) => {
    const isExpanded = expandedModules.has(moduleCode);
    const permCount = getModulePermissionCount(resources);
    const hasAll = hasAllPermissionsForModule(resources);
    const allTypes = Object.values(PermissionType).filter((v) => typeof v === 'number');
    const maxPerms = resources.length * allTypes.length;
    const iconColor = MODULE_ICON_COLORS[moduleCode] || '#6366f1';

    return (
      <div key={moduleCode} className="mb-4">
        {/* Module Header */}
        <div
          className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleModule(moduleCode)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <span style={{ color: iconColor }} className="text-sm font-medium">
                {moduleName.charAt(0)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-900">{moduleName}</span>
              <span className="text-xs text-slate-400 ml-2">{resources.length} kaynak</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Checkbox
              checked={hasAll}
              indeterminate={permCount > 0 && !hasAll}
              onChange={(e) => {
                e.stopPropagation();
                handleToggleAllForModule(resources, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-slate-500 min-w-[50px] text-right">
              {permCount}/{maxPerms}
            </span>
            {isExpanded ? (
              <ChevronDownIcon className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRightIcon className="w-3 h-3 text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded Resources - Stacked List */}
        {isExpanded && (
          <div className="mt-1 bg-white border border-slate-200 rounded-lg px-4">
            {resources.map(resource => renderResourceRow(resource))}
          </div>
        )}
      </div>
    );
  };

  if (modulesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Yeni Rol</h1>
              <p className="text-sm text-slate-500">Rol bilgilerini ve yetkilerini tanımlayın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={createMutation.isPending}
        >
          {/* Role Details Section */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Rol Bilgileri</h2>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="name"
                  label={<span className="text-sm text-slate-600">Rol Adı</span>}
                  rules={[
                    { required: true, message: 'Rol adı zorunludur' },
                    { min: 2, message: 'En az 2 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="örn: Satış Yöneticisi"
                    className="h-10"
                  />
                </Form.Item>

                {allRoles && allRoles.length > 0 && (
                  <Form.Item
                    label={<span className="text-sm text-slate-600">Şablondan Kopyala</span>}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Mevcut rolden kopyala (isteğe bağlı)"
                      allowClear
                      className="h-10"
                      value={copyFromRoleId}
                      onChange={handleCopyFromRole}
                      options={allRoles
                        .filter((r) => !r.isSystemRole)
                        .map((r) => ({
                          label: `${r.name} (${r.permissions.length} yetki)`,
                          value: r.id,
                        }))}
                    />
                  </Form.Item>
                )}
              </div>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-600">Açıklama</span>}
                className="mb-0 mt-6"
              >
                <Input.TextArea
                  placeholder="Bu rolün görev ve sorumluluklarını açıklayın..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </div>
          </section>

          {/* Permissions Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-900">Yetkiler</h2>
              <span className="text-xs text-slate-500">
                {selectedPermissions.length} yetki seçildi
              </span>
            </div>

            {/* Permission Modules - Stacked List */}
            {renderModuleSection('CORE', 'Sistem Yönetimi', coreResources)}

            {moduleResources.map((module) =>
              renderModuleSection(
                module.moduleCode,
                module.moduleName,
                module.resources
              )
            )}

            {moduleResources.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                <p className="text-sm text-slate-500">
                  Aboneliğinize dahil ek modül bulunmuyor.
                </p>
              </div>
            )}
          </section>

          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {selectedPermissions.length > 0 ? (
                <span className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  {selectedPermissions.length} yetki seçildi
                </span>
              ) : (
                <span>Henüz yetki seçilmedi</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/settings/roles')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => form.submit()}
                disabled={createMutation.isPending || selectedPermissions.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? 'Kaydediliyor...' : 'Rolü Oluştur'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
