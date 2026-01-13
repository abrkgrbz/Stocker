'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Alert, Tag, Tabs, Table, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  StopIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useWorkCenter, useDeleteWorkCenter, useActivateWorkCenter, useDeactivateWorkCenter } from '@/lib/api/hooks/useManufacturing';
import type { WorkCenterType } from '@/lib/api/services/manufacturing.types';
import { confirmDelete } from '@/lib/utils/sweetalert';

// Work center type configuration
const typeConfig: Record<WorkCenterType, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Machine: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Makine', icon: <Cog6ToothIcon className="w-4 h-4" /> },
  Labor: { color: '#334155', bgColor: '#f1f5f9', label: 'İşçilik', icon: <UserGroupIcon className="w-4 h-4" /> },
  Subcontract: { color: '#475569', bgColor: '#f8fafc', label: 'Fason', icon: <TruckIcon className="w-4 h-4" /> },
  Mixed: { color: '#64748b', bgColor: '#f1f5f9', label: 'Karma', icon: <WrenchScrewdriverIcon className="w-4 h-4" /> },
};

export default function WorkCenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workCenterId = params.id as string;

  const { data: workCenter, isLoading, error } = useWorkCenter(workCenterId);
  const deleteWorkCenter = useDeleteWorkCenter();
  const activateWorkCenter = useActivateWorkCenter();
  const deactivateWorkCenter = useDeactivateWorkCenter();

  const handleDelete = async () => {
    if (!workCenter) return;
    const confirmed = await confirmDelete('İş Merkezi', workCenter.name);
    if (confirmed) {
      try {
        await deleteWorkCenter.mutateAsync(workCenter.id);
        router.push('/manufacturing/work-centers');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleToggleActive = async () => {
    if (!workCenter) return;
    try {
      if (workCenter.isActive) {
        await deactivateWorkCenter.mutateAsync(workCenter.id);
      } else {
        await activateWorkCenter.mutateAsync(workCenter.id);
      }
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !workCenter) {
    return (
      <div className="p-8">
        <Alert
          message="İş Merkezi Bulunamadı"
          description="İstenen iş merkezi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/work-centers')}>
              İş Merkezlerine Dön
            </Button>
          }
        />
      </div>
    );
  }

  const typeInfo = typeConfig[workCenter.type] || { color: '#64748b', bgColor: '#f1f5f9', label: workCenter.type, icon: null };

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
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/manufacturing/work-centers')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: typeInfo.bgColor }}
              >
                {typeInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {workCenter.code}
                  </h1>
                  <Tag
                    className="ml-2"
                    style={{
                      backgroundColor: workCenter.isActive ? '#e2e8f0' : '#f1f5f9',
                      color: workCenter.isActive ? '#1e293b' : '#64748b',
                      border: 'none',
                    }}
                  >
                    {workCenter.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{workCenter.name}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={workCenter.isActive ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
              loading={activateWorkCenter.isPending || deactivateWorkCenter.isPending}
              className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
            >
              {workCenter.isActive ? 'Pasifleştir' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<PencilSquareIcon className="w-4 h-4" />}
              onClick={() => router.push(`/manufacturing/work-centers/${workCenterId}/edit`)}
              className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
              loading={deleteWorkCenter.isPending}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* KPI Cards - Bento Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{workCenter.capacityPerHour}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kapasite/Saat</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-700">
                ₺{workCenter.hourlyRate.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Maliyet/Saat</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-slate-800" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{workCenter.efficiency}%</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Verimlilik</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: typeInfo.bgColor }}
                >
                  {typeInfo.icon}
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: typeInfo.color }}>{typeInfo.label}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tür</div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">İş Merkezi Bilgileri</h2>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Kod">{workCenter.code}</Descriptions.Item>
            <Descriptions.Item label="Ad">{workCenter.name}</Descriptions.Item>
            <Descriptions.Item label="Tür">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.color }}
              >
                {typeInfo.icon}
                {typeInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Kapasite/Saat">{workCenter.capacityPerHour}</Descriptions.Item>
            <Descriptions.Item label="Maliyet/Saat">
              ₺{workCenter.hourlyRate.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Descriptions.Item>
            <Descriptions.Item label="Verimlilik">{workCenter.efficiency}%</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: workCenter.isActive ? '#e2e8f0' : '#f1f5f9',
                  color: workCenter.isActive ? '#1e293b' : '#64748b',
                }}
              >
                {workCenter.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <StopIcon className="w-3 h-3" />}
                {workCenter.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama" span={2}>
              {workCenter.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Tabs for related info */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Tabs
            defaultActiveKey="schedule"
            items={[
              {
                key: 'schedule',
                label: 'Çalışma Takvimi',
                children: (
                  <div className="py-4">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Çalışma takvimi bilgisi bulunamadı"
                    />
                  </div>
                ),
              },
              {
                key: 'operations',
                label: 'Operasyonlar',
                children: (
                  <div className="py-4">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Henüz operasyon tanımlanmamış"
                    />
                  </div>
                ),
              },
              {
                key: 'maintenance',
                label: 'Bakım Kayıtları',
                children: (
                  <div className="py-4">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Bakım kaydı bulunamadı"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
