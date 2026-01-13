'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Alert, Tag, Table, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  DocumentCheckIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  useRouting,
  useDeleteRouting,
  useApproveRouting,
  useActivateRouting,
} from '@/lib/api/hooks/useManufacturing';
import type { RoutingStatus, RoutingOperationDto } from '@/lib/api/services/manufacturing.types';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// Routing status configuration
const statusConfig: Record<RoutingStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-4 h-4" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Obsolete: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Geçersiz', icon: <ArchiveBoxIcon className="w-4 h-4" /> },
};

export default function RoutingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const routingId = params.id as string;

  const { data: routing, isLoading, error } = useRouting(routingId);
  const deleteRouting = useDeleteRouting();
  const approveRouting = useApproveRouting();
  const activateRouting = useActivateRouting();

  const handleDelete = async () => {
    if (!routing) return;
    const confirmed = await confirmDelete('Rota', routing.routingNumber);
    if (confirmed) {
      try {
        await deleteRouting.mutateAsync(routing.id);
        router.push('/manufacturing/routings');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async () => {
    try {
      await approveRouting.mutateAsync(routingId);
    } catch {
      // Error handled by hook
    }
  };

  const handleActivate = async () => {
    try {
      await activateRouting.mutateAsync(routingId);
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

  if (error || !routing) {
    return (
      <div className="p-8">
        <Alert
          message="Rota Bulunamadı"
          description="İstenen rota bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/routings')}>
              Rotalara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[routing.status] || { color: '#64748b', bgColor: '#f1f5f9', label: routing.status, icon: null };
  const canEdit = routing.status === 'Draft' || routing.status === 'Approved';
  const canDelete = routing.status === 'Draft';

  const operationColumns = [
    {
      title: 'Sıra',
      dataIndex: 'operationNumber',
      key: 'operationNumber',
      width: 80,
    },
    {
      title: 'İş Merkezi',
      dataIndex: 'workCenterName',
      key: 'workCenterName',
      width: 200,
    },
    {
      title: 'Operasyon',
      key: 'operation',
      width: 200,
      render: (_: unknown, record: RoutingOperationDto) => (
        <div>
          <div className="font-medium text-slate-900">{record.operationName}</div>
          {record.description && (
            <div className="text-xs text-slate-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Hazırlık',
      dataIndex: 'setupTime',
      key: 'setupTime',
      width: 100,
      render: (v: number) => `${v} dk`,
    },
    {
      title: 'Çalışma',
      dataIndex: 'runTime',
      key: 'runTime',
      width: 100,
      render: (v: number) => `${v} dk`,
    },
    {
      title: 'Bekleme',
      dataIndex: 'waitTime',
      key: 'waitTime',
      width: 100,
      render: (v: number) => `${v} dk`,
    },
    {
      title: 'Taşıma',
      dataIndex: 'moveTime',
      key: 'moveTime',
      width: 100,
      render: (v: number) => `${v} dk`,
    },
    {
      title: 'Örtüşme',
      dataIndex: 'overlapPercentage',
      key: 'overlapPercentage',
      width: 100,
      render: (v?: number) => v ? `%${v}` : '-',
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
              onClick={() => router.push('/manufacturing/routings')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <ArrowsRightLeftIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {routing.routingNumber}
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
                  {routing.isDefault && (
                    <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
                      Varsayılan
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-400 m-0">{routing.productName} - v{routing.version}</p>
              </div>
            </div>
          </div>
          <Space>
            {routing.status === 'Draft' && (
              <Button
                icon={<DocumentCheckIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveRouting.isPending}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Onayla
              </Button>
            )}
            {routing.status === 'Approved' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleActivate}
                loading={activateRouting.isPending}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Aktifleştir
              </Button>
            )}
            {canEdit && (
              <Button
                icon={<PencilSquareIcon className="w-4 h-4" />}
                onClick={() => router.push(`/manufacturing/routings/${routingId}/edit`)}
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
                loading={deleteRouting.isPending}
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
                  <Cog6ToothIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{routing.operations?.length || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Operasyon</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-700">{routing.totalSetupTime} dk</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Hazırlık</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-slate-800" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{routing.totalRunTime} dk</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Çalışma</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-600">
                {routing.totalSetupTime + routing.totalRunTime} dk
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Süre</div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rota Bilgileri</h2>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Rota No">{routing.routingNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{routing.productName}</Descriptions.Item>
            <Descriptions.Item label="Versiyon">{routing.version}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Geçerlilik Başlangıcı">
              {routing.effectiveDate ? dayjs(routing.effectiveDate).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Geçerlilik Bitişi">
              {routing.expiryDate ? dayjs(routing.expiryDate).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Varsayılan">
              {routing.isDefault ? 'Evet' : 'Hayır'}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturma Tarihi">
              {routing.createdAt ? dayjs(routing.createdAt).format('DD.MM.YYYY HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturan">
              {routing.createdBy || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama" span={3}>
              {routing.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Operations Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Operasyonlar</h2>
          <Table
            columns={operationColumns}
            dataSource={routing.operations || []}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Operasyon bulunamadı"
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
