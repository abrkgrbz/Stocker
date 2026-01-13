'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Alert, Tag, Table, Empty, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useMasterProductionSchedule,
  useDeleteMasterProductionSchedule,
  useMpsLines,
} from '@/lib/api/hooks/useManufacturing';
import type { MpsStatus, PeriodType, MpsLineListDto } from '@/lib/api/services/manufacturing.types';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// MPS status configuration
const statusConfig: Record<MpsStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-4 h-4" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Completed: { color: '#475569', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
};

const periodTypeLabels: Record<PeriodType, string> = {
  Daily: 'Günlük',
  Weekly: 'Haftalık',
  Monthly: 'Aylık',
};

export default function MpsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const mpsId = params.id as string;

  const { data: mps, isLoading, error } = useMasterProductionSchedule(mpsId);
  const { data: lines = [], isLoading: linesLoading } = useMpsLines(mpsId, {});
  const deleteMps = useDeleteMasterProductionSchedule();

  const handleDelete = async () => {
    if (!mps) return;
    const confirmed = await confirmDelete('Ana Üretim Planı', mps.name);
    if (confirmed) {
      try {
        await deleteMps.mutateAsync(mps.id);
        router.push('/manufacturing/master-production-schedules');
      } catch {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !mps) {
    return (
      <div className="p-8">
        <Alert
          message="Plan Bulunamadı"
          description="İstenen ana üretim planı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/master-production-schedules')}>
              Planlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[mps.status] || { color: '#64748b', bgColor: '#f1f5f9', label: mps.status, icon: null };
  const canEdit = mps.status === 'Draft' || mps.status === 'Approved';
  const canDelete = mps.status === 'Draft';

  // Calculate totals from lines
  const totalForecast = lines.reduce((sum, l) => sum + l.forecastQuantity, 0);
  const totalPlanned = lines.reduce((sum, l) => sum + l.plannedProductionQuantity, 0);
  const totalActual = lines.reduce((sum, l) => sum + l.actualProductionQuantity, 0);

  const lineColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_: unknown, record: MpsLineListDto) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 180,
      render: (_: unknown, record: MpsLineListDto) => (
        <div className="text-sm">
          <span className="text-slate-600">
            {dayjs(record.periodStart).format('DD.MM')}
          </span>
          <span className="text-slate-400 mx-1">-</span>
          <span className="text-slate-600">
            {dayjs(record.periodEnd).format('DD.MM.YYYY')}
          </span>
        </div>
      ),
    },
    {
      title: 'Tahmin',
      dataIndex: 'forecastQuantity',
      key: 'forecastQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-700">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Planlanan',
      dataIndex: 'plannedProductionQuantity',
      key: 'plannedProductionQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-900">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Gerçekleşen',
      dataIndex: 'actualProductionQuantity',
      key: 'actualProductionQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-700">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Emniyet Stoğu',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="text-slate-500">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Gerçekleşme',
      key: 'progress',
      width: 150,
      render: (_: unknown, record: MpsLineListDto) => {
        const percent = record.plannedProductionQuantity > 0
          ? Math.round((record.actualProductionQuantity / record.plannedProductionQuantity) * 100)
          : 0;
        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor="#475569"
            trailColor="#e2e8f0"
          />
        );
      },
    },
  ];

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
              onClick={() => router.push('/manufacturing/master-production-schedules')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <CalendarDaysIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {mps.name}
                  </h1>
                  <Tag
                    className="ml-2"
                    style={{
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.color,
                      border: 'none',
                    }}
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{periodTypeLabels[mps.periodType]} Plan</p>
              </div>
            </div>
          </div>
          <Space>
            {canEdit && (
              <Button
                icon={<PencilSquareIcon className="w-4 h-4" />}
                onClick={() => router.push(`/manufacturing/master-production-schedules/${mpsId}/edit`)}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Düzenle
              </Button>
            )}
            {canDelete && (
              <Button
                danger
                icon={<TrashIcon className="w-4 h-4" />}
                onClick={handleDelete}
                loading={deleteMps.isPending}
              >
                Sil
              </Button>
            )}
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
              <div className="text-2xl font-bold text-slate-900">{lines.length}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Satır</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-700">{totalForecast.toLocaleString('tr-TR')}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tahmin</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-slate-800" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{totalPlanned.toLocaleString('tr-TR')}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Planlanan</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-600">{totalActual.toLocaleString('tr-TR')}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Gerçekleşen</div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Bilgileri</h2>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Plan Adı">{mps.name}</Descriptions.Item>
            <Descriptions.Item label="Periyot Tipi">{periodTypeLabels[mps.periodType]}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç">
              {mps.planningHorizonStart ? dayjs(mps.planningHorizonStart).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bitiş">
              {mps.planningHorizonEnd ? dayjs(mps.planningHorizonEnd).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturma">
              {mps.createdAt ? dayjs(mps.createdAt).format('DD.MM.YYYY HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama" span={3}>
              {mps.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Lines Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Plan Satırları</h2>
            {canEdit && (
              <Button
                type="dashed"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={() => router.push(`/manufacturing/master-production-schedules/${mpsId}/lines/new`)}
              >
                Satır Ekle
              </Button>
            )}
          </div>
          <Table
            columns={lineColumns}
            dataSource={lines}
            rowKey="id"
            loading={linesLoading}
            pagination={false}
            scroll={{ x: 1100 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Plan satırı bulunamadı"
                />
              ),
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
