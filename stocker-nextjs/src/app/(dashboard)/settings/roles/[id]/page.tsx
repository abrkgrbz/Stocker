'use client';

/**
 * Role Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Bento grid layout for role information
 * - Categorized accordion layout for permissions (reduces visual noise)
 * - Clean white cards with subtle borders
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Input } from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  ShieldCheckIcon,
  UsersIcon,
  LockClosedIcon,
  CalendarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InboxIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRole } from '@/hooks/useRoles';
import {
  parsePermission,
  PERMISSION_TYPE_LABELS,
  AVAILABLE_RESOURCES,
  MODULE_RESOURCES,
  type Permission,
  type PermissionType,
  type ModuleResourceCategory,
} from '@/lib/api/roles';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Interface for categorized permissions
interface CategoryPermissions {
  categoryCode: string;
  categoryName: string;
  resources: {
    resource: string;
    resourceLabel: string;
    permissions: Permission[];
  }[];
  totalPermissions: number;
}

// Get icon component for category
const getCategoryIcon = (categoryCode: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    CORE: <Cog6ToothIcon className="w-5 h-5 text-indigo-500" />,
    INVENTORY: <InboxIcon className="w-5 h-5 text-indigo-500" />,
    SALES: <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />,
    PURCHASE: <ShoppingCartIcon className="w-5 h-5 text-indigo-500" />,
    CRM: <UserIcon className="w-5 h-5 text-indigo-500" />,
    HR: <UsersIcon className="w-5 h-5 text-indigo-500" />,
    FINANCE: <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />,
    CMS: <DocumentTextIcon className="w-5 h-5 text-indigo-500" />,
  };
  return iconMap[categoryCode] || <Squares2X2Icon className="w-5 h-5 text-indigo-500" />;
};

/**
 * Helper function to group permissions by module/category
 */
function groupPermissionsByCategory(permissions: Permission[]): CategoryPermissions[] {
  const categories: CategoryPermissions[] = [];

  // Create a map for quick resource lookup
  const resourceToModule = new Map<string, ModuleResourceCategory>();
  MODULE_RESOURCES.forEach((module) => {
    module.resources.forEach((res) => {
      resourceToModule.set(res.value, module);
    });
  });

  // Group permissions by category
  const categoryMap = new Map<string, CategoryPermissions>();

  // Initialize Core category
  categoryMap.set('CORE', {
    categoryCode: 'CORE',
    categoryName: 'Sistem & Güvenlik',
    resources: [],
    totalPermissions: 0,
  });

  // Initialize module categories
  MODULE_RESOURCES.forEach((module) => {
    categoryMap.set(module.moduleCode, {
      categoryCode: module.moduleCode,
      categoryName: module.moduleName,
      resources: [],
      totalPermissions: 0,
    });
  });

  // Group permissions
  permissions.forEach((perm) => {
    const moduleInfo = resourceToModule.get(perm.resource);
    const categoryCode = moduleInfo?.moduleCode || 'CORE';
    const category = categoryMap.get(categoryCode);

    if (category) {
      // Find or create resource group
      let resourceGroup = category.resources.find((r) => r.resource === perm.resource);
      if (!resourceGroup) {
        const resourceDef = AVAILABLE_RESOURCES.find((r) => r.value === perm.resource);
        resourceGroup = {
          resource: perm.resource,
          resourceLabel: resourceDef?.label || perm.resource,
          permissions: [],
        };
        category.resources.push(resourceGroup);
      }
      resourceGroup.permissions.push(perm);
      category.totalPermissions++;
    }
  });

  // Convert map to array and filter out empty categories
  categoryMap.forEach((category) => {
    if (category.totalPermissions > 0) {
      categories.push(category);
    }
  });

  // Sort: CORE first, then by total permissions descending
  categories.sort((a, b) => {
    if (a.categoryCode === 'CORE') return -1;
    if (b.categoryCode === 'CORE') return 1;
    return b.totalPermissions - a.totalPermissions;
  });

  return categories;
}

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { data: role, isLoading, error } = useRole(roleId);

  // Parse and categorize permissions
  const { permissions, categorizedPermissions, filteredCategories, totalFilteredCount } =
    useMemo(() => {
      if (!role)
        return {
          permissions: [],
          categorizedPermissions: [],
          filteredCategories: [],
          totalFilteredCount: 0,
        };

      const perms = role.permissions.map(parsePermission);
      const categories = groupPermissionsByCategory(perms);

      // Filter based on search query
      const searchLower = searchQuery.toLowerCase().trim();
      if (!searchLower) {
        return {
          permissions: perms,
          categorizedPermissions: categories,
          filteredCategories: categories,
          totalFilteredCount: perms.length,
        };
      }

      // Filter categories and resources
      const filtered: CategoryPermissions[] = [];
      let count = 0;

      categories.forEach((category) => {
        const categoryMatches =
          category.categoryName.toLowerCase().includes(searchLower) ||
          category.categoryCode.toLowerCase().includes(searchLower);

        const filteredResources = category.resources
          .map((res) => {
            const resourceMatches =
              categoryMatches || res.resourceLabel.toLowerCase().includes(searchLower);

            const matchingPerms = res.permissions.filter((perm) => {
              const permLabel = PERMISSION_TYPE_LABELS[perm.permissionType as PermissionType] || '';
              return resourceMatches || permLabel.toLowerCase().includes(searchLower);
            });

            if (matchingPerms.length > 0) {
              return {
                ...res,
                permissions: matchingPerms,
              };
            }
            return null;
          })
          .filter(Boolean) as CategoryPermissions['resources'];

        if (filteredResources.length > 0) {
          const totalPerms = filteredResources.reduce((sum, r) => sum + r.permissions.length, 0);
          filtered.push({
            ...category,
            resources: filteredResources,
            totalPermissions: totalPerms,
          });
          count += totalPerms;
        }
      });

      return {
        permissions: perms,
        categorizedPermissions: categories,
        filteredCategories: filtered,
        totalFilteredCount: count,
      };
    }, [role, searchQuery]);

  // Expand/Collapse all
  const handleExpandAll = () => {
    setExpandedCategories(filteredCategories.map((c) => c.categoryCode));
  };

  const handleCollapseAll = () => {
    setExpandedCategories([]);
  };

  const toggleCategory = (categoryCode: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryCode)
        ? prev.filter((c) => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Rol bulunamadı" />
      </div>
    );
  }

  const getRoleIcon = () => {
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/settings/roles')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: '#6366f115' }}
              >
                {getRoleIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{role.name}</h1>
                  {role.isSystemRole && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md">
                      <LockClosedIcon className="w-3 h-3" />
                      Sistem Rolü
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {role.description || 'Açıklama bulunmuyor'}
                </p>
              </div>
            </div>
          </div>
          {!role.isSystemRole && (
            <button
              onClick={() => router.push(`/settings/roles/${role.id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Role Info - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Rol Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rol Adı</p>
                  <p className="text-sm font-medium text-slate-900">{role.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rol Tipi</p>
                  {role.isSystemRole ? (
                    <Tag color="purple" className="m-0">
                      <LockClosedIcon className="w-3 h-3 mr-1 inline" />
                      Sistem Rolü
                    </Tag>
                  ) : (
                    <Tag color="blue" className="m-0">
                      Özel Rol
                    </Tag>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kullanıcı Sayısı</p>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{role.userCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Yetki Sayısı</p>
                  <div className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {role.permissions.length}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(role.createdDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Modül Sayısı</p>
                  <div className="flex items-center gap-1">
                    <Squares2X2Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {categorizedPermissions.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {role.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{role.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#6366f115' }}
                >
                  {getRoleIcon()}
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-3">{role.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {role.isSystemRole ? 'Sistem Rolü' : 'Özel Rol'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Atanan Kullanıcı</span>
                  <span className="font-medium text-slate-900">{role.userCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Toplam Yetki</span>
                  <span className="font-medium text-slate-900">{role.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Modül Sayısı</span>
                  <span className="font-medium text-slate-900">
                    {categorizedPermissions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section - Full Width with Accordion */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              {/* Sticky Header with Search and Controls */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                      Yetkiler ({role.permissions.length})
                    </p>
                    {searchQuery && totalFilteredCount !== role.permissions.length && (
                      <span className="text-xs text-slate-400">• {totalFilteredCount} sonuç</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Expand/Collapse All */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleExpandAll}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        Tümünü Aç
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={handleCollapseAll}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        Tümünü Kapat
                      </button>
                    </div>
                    <Input
                      placeholder="Yetki veya modül ara..."
                      prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      allowClear
                      className="w-full sm:w-64"
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                </div>
              </div>

              {/* Categorized Accordion Layout */}
              {filteredCategories.length > 0 ? (
                <div className="space-y-3">
                  {filteredCategories.map((category) => {
                    const isExpanded = expandedCategories.includes(category.categoryCode);

                    return (
                      <div
                        key={category.categoryCode}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleCategory(category.categoryCode)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                              {getCategoryIcon(category.categoryCode)}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-slate-900 m-0">
                                {category.categoryName}
                              </p>
                              <p className="text-xs text-slate-500 m-0">
                                {category.resources.length} kaynak •{' '}
                                {category.totalPermissions} yetki
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                              {category.totalPermissions}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronDownIcon className="w-3 h-3" />
                            </div>
                          </div>
                        </button>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {category.resources.map((res) => (
                                <div
                                  key={res.resource}
                                  className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                                >
                                  {/* Resource Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
                                        <LockClosedIcon className="w-3 h-3 text-indigo-500" />
                                      </div>
                                      <p className="text-sm font-medium text-slate-900 m-0 truncate">
                                        {res.resourceLabel}
                                      </p>
                                    </div>
                                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                      {res.permissions.length}
                                    </span>
                                  </div>

                                  {/* Permission Tags */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {res.permissions.map((perm, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 group-hover:border-indigo-200 group-hover:text-indigo-700 transition-colors"
                                      >
                                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                                        {
                                          PERMISSION_TYPE_LABELS[
                                            perm.permissionType as PermissionType
                                          ]
                                        }
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-1">Aramanızla eşleşen yetki bulunamadı</p>
                  <p className="text-sm text-slate-400">
                    &quot;{searchQuery}&quot; için sonuç yok
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Aramayı Temizle
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500">Bu rolde henüz yetki bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
