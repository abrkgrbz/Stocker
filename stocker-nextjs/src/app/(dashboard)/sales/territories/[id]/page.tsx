'use client';

/**
 * Sales Territory Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spin, Alert, Space, Dropdown, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
  EllipsisHorizontalIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { MenuProps } from 'antd';
import {
  useSalesTerritory,
  useActivateSalesTerritory,
  useDeactivateSalesTerritory,
  useDeleteSalesTerritory,
} from '@/lib/api/hooks/useSales';
import { PageContainer, Card, StatCard, Badge } from '@/components/ui/enterprise-page';
import type { TerritoryType, TerritoryStatus, TerritoryAssignmentRole } from '@/lib/api/services/sales.service';

const typeLabels: Record<TerritoryType, string> = {
  Country: 'Ülke',
  Region: 'Bölge',
  City: 'Şehir',
  District: 'İlçe',
  Zone: 'Zon',
  Custom: 'Özel',
};

const statusLabels: Record<TerritoryStatus, string> = {
  Active: 'Aktif',
  Inactive: 'Pasif',
  Suspended: 'Askıda',
};

const roleLabels: Record<TerritoryAssignmentRole, string> = {
  Primary: 'Birincil',
  Secondary: 'İkincil',
  Support: 'Destek',
  Manager: 'Yönetici',
};

export default function TerritoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: territory, isLoading, error } = useSalesTerritory(id);
  const activateMutation = useActivateSalesTerritory();
  const deactivateMutation = useDeactivateSalesTerritory();
  const deleteMutation = useDeleteSalesTerritory();

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.push('/sales/territories');
    } catch {
      // Error handled by hook
    }
  };

  const actionMenuItems: MenuProps['items'] = [];
  const isActive = territory?.status === 'Active';

  if (territory && !isActive) {
    actionMenuItems.push({
      key: 'activate',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Aktifleştir',
      onClick: handleActivate,
    });
  }

  if (isActive) {
    actionMenuItems.push({
      key: 'deactivate',
      icon: <StopOutlined />,
      label: 'Pasifleştir',
      onClick: handleDeactivate,
    });
  }

  actionMenuItems.push(
    { type: 'divider' },
    {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: handleDelete,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !territory) {
    return (
      <div className="p-8">
        <Alert
          message="Bölge Bulunamadı"
          description="İstenen bölge bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/sales/territories')}>Geri Dön</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  {territory.name}
                </h1>
                <Badge variant={territory.status === 'Active' ? 'success' : territory.status === 'Suspended' ? 'warning' : 'default'}>
                  {statusLabels[territory.status]}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 m-0">
                {territory.territoryCode} • {typeLabels[territory.territoryType]}
              </p>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/sales/territories/${id}/edit`)}
            >
              Düzenle
            </Button>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Content */}
      <PageContainer maxWidth="6xl">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Bölge Tipi"
            value={typeLabels[territory.territoryType]}
            icon={<GlobeAltIcon className="w-4 h-4" className="text-purple-500" />}
          />
          <StatCard
            label="Müşteri Sayısı"
            value={territory.customerCount}
            icon={<UserGroupIcon className="w-4 h-4" className="text-blue-500" />}
          />
          <StatCard
            label="Yıllık Hedef"
            value={
              territory.annualTarget
                ? new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: territory.annualTarget.currency,
                  }).format(territory.annualTarget.amount)
                : '-'
            }
            icon={<CursorArrowRaysIcon className="w-4 h-4" className="text-green-500" />}
          />
          <StatCard
            label="Durum"
            value={statusLabels[territory.status]}
            icon={
              territory.status === 'Active' ? (
                <CheckCircleIcon className="w-4 h-4" className="text-emerald-500" />
              ) : (
                <StopOutlined className="text-slate-400" />
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Territory Information */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Bölge Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Bölge Kodu
                  </p>
                  <p className="text-sm text-slate-900 font-medium">{territory.territoryCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Bölge Adı
                  </p>
                  <p className="text-sm text-slate-900 font-medium">{territory.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Bölge Tipi
                  </p>
                  <Tag color="purple">{typeLabels[territory.territoryType]}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Bölge Yöneticisi
                  </p>
                  <p className="text-sm text-slate-900">
                    {territory.territoryManagerName || '-'}
                  </p>
                </div>
                {territory.region && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Bölge
                    </p>
                    <p className="text-sm text-slate-900">{territory.region}</p>
                  </div>
                )}
                {territory.city && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Şehir
                    </p>
                    <p className="text-sm text-slate-900">{territory.city}</p>
                  </div>
                )}
              </div>
              {territory.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Açıklama
                  </p>
                  <p className="text-sm text-slate-600">{territory.description}</p>
                </div>
              )}
            </Card>

            {/* Annual Target */}
            {territory.annualTarget && (
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Yıllık Hedef
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Hedef Tutarı
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: territory.annualTarget.currency,
                      }).format(territory.annualTarget.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Para Birimi
                    </p>
                    <p className="text-sm text-slate-900">{territory.annualTarget.currency}</p>
                  </div>
                  {territory.lastPerformanceScore !== undefined && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                        Performans Puanı
                      </p>
                      <p className="text-sm text-slate-900">{territory.lastPerformanceScore}%</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Customers in Territory */}
            {territory.customers && territory.customers.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Bölge Müşterileri ({territory.customers.length})
                </h3>
                <div className="space-y-2">
                  {territory.customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/crm/customers/${customer.customerId}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{customer.customerName}</p>
                        {customer.primarySalesRepresentativeId && (
                          <p className="text-xs text-slate-500">Atanan temsilci mevcut</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Territory Assignments */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Atanan Temsilciler
              </h3>
              {territory.assignments && territory.assignments.length > 0 ? (
                <div className="space-y-2">
                  {territory.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {assignment.salesRepresentativeName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {roleLabels[assignment.role]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.role === 'Primary' && (
                          <Tag color="blue">Birincil</Tag>
                        )}
                        <Badge variant={assignment.isActive ? 'success' : 'default'}>
                          {assignment.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Atanan temsilci yok</p>
              )}
            </Card>

            {/* Territory Info */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Bölge Detayları
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Hiyerarşi Seviyesi
                  </p>
                  <p className="text-sm text-slate-600">{territory.hierarchyLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Hiyerarşi Yolu
                  </p>
                  <p className="text-sm text-slate-600">{territory.hierarchyPath || '-'}</p>
                </div>
                {territory.lastPerformanceScore !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Performans Puanı
                    </p>
                    <p className="text-sm text-slate-600">{territory.lastPerformanceScore}%</p>
                  </div>
                )}
                {territory.lastPerformanceDate && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Son Performans Tarihi
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(territory.lastPerformanceDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
