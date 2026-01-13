'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Alert, Tag, Table, Empty, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useMaterialReservation,
  useCancelMaterialReservation,
  useApproveMaterialReservation,
} from '@/lib/api/hooks/useManufacturing';
import type { ReservationStatus, ReservationPriority, MaterialReservationAllocationDto, MaterialReservationIssueDto } from '@/lib/api/services/manufacturing.types';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// Reservation status configuration
const statusConfig: Record<ReservationStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Bekliyor', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-4 h-4" /> },
  Allocated: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Ayrıldı', icon: <CubeIcon className="w-4 h-4" /> },
  Issued: { color: '#475569', bgColor: '#e2e8f0', label: 'Çıkış Yapıldı', icon: <ArrowDownTrayIcon className="w-4 h-4" /> },
  Completed: { color: '#1e293b', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal', icon: <XMarkIcon className="w-4 h-4" /> },
};

const priorityConfig: Record<ReservationPriority, { color: string; bgColor: string; label: string }> = {
  Low: { color: '#64748b', bgColor: '#f1f5f9', label: 'Düşük' },
  Normal: { color: '#475569', bgColor: '#e2e8f0', label: 'Normal' },
  High: { color: '#334155', bgColor: '#cbd5e1', label: 'Yüksek' },
  Urgent: { color: '#1e293b', bgColor: '#94a3b8', label: 'Acil' },
};

export default function MaterialReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const { data: reservation, isLoading, error } = useMaterialReservation(reservationId);
  const cancelReservation = useCancelMaterialReservation();
  const approveReservation = useApproveMaterialReservation();

  const handleCancel = async () => {
    if (!reservation) return;
    const confirmed = await confirmDelete('Malzeme Rezervasyonu', reservation.reservationNumber);
    if (confirmed) {
      try {
        await cancelReservation.mutateAsync(reservation.id);
        router.push('/manufacturing/material-reservations');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async () => {
    try {
      await approveReservation.mutateAsync({ id: reservationId, data: {} });
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

  if (error || !reservation) {
    return (
      <div className="p-8">
        <Alert
          message="Rezervasyon Bulunamadı"
          description="İstenen malzeme rezervasyonu bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/material-reservations')}>
              Rezervasyonlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[reservation.status] || { color: '#64748b', bgColor: '#f1f5f9', label: reservation.status, icon: null };
  const priorityInfo = priorityConfig[reservation.priority] || { color: '#64748b', bgColor: '#f1f5f9', label: reservation.priority };
  const canEdit = reservation.status === 'Pending';
  const canDelete = reservation.status === 'Pending';
  const canApprove = reservation.status === 'Pending';

  const percent = reservation.requiredQuantity > 0
    ? Math.round((reservation.allocatedQuantity / reservation.requiredQuantity) * 100)
    : 0;

  const allocationColumns = [
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 200,
    },
    {
      title: 'Lokasyon',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 150,
      render: (v?: string) => v || '-',
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 120,
      render: (v?: string) => v || '-',
    },
    {
      title: 'Miktar',
      dataIndex: 'allocatedQuantity',
      key: 'allocatedQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-900">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'allocatedAt',
      key: 'allocatedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Ayıran',
      dataIndex: 'allocatedBy',
      key: 'allocatedBy',
      width: 150,
    },
  ];

  const issueColumns = [
    {
      title: 'Miktar',
      dataIndex: 'issuedQuantity',
      key: 'issuedQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-900">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Çıkış Tarihi',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Çıkış Yapan',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
      width: 150,
    },
    {
      title: 'İade Miktar',
      dataIndex: 'returnedQuantity',
      key: 'returnedQuantity',
      width: 100,
      align: 'right' as const,
      render: (v?: number) => v ? <span className="text-slate-600">{v.toLocaleString('tr-TR')}</span> : '-',
    },
    {
      title: 'İade Tarihi',
      dataIndex: 'returnedAt',
      key: 'returnedAt',
      width: 150,
      render: (date?: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
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
              onClick={() => router.push('/manufacturing/material-reservations')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <CubeIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {reservation.reservationNumber}
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
                  <Tag
                    style={{
                      backgroundColor: priorityInfo.bgColor,
                      color: priorityInfo.color,
                      border: 'none',
                    }}
                  >
                    {priorityInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{reservation.productName}</p>
              </div>
            </div>
          </div>
          <Space>
            {canApprove && (
              <Button
                icon={<DocumentCheckIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveReservation.isPending}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Onayla
              </Button>
            )}
            {canEdit && (
              <Button
                icon={<PencilSquareIcon className="w-4 h-4" />}
                onClick={() => router.push(`/manufacturing/material-reservations/${reservationId}/edit`)}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Düzenle
              </Button>
            )}
            {canDelete && (
              <Button
                danger
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelReservation.isPending}
              >
                İptal Et
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Gerekli</div>
              <div className="text-2xl font-bold text-slate-900">{reservation.requiredQuantity.toLocaleString('tr-TR')}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Ayrılan</div>
              <div className="text-2xl font-bold text-slate-700">{reservation.allocatedQuantity.toLocaleString('tr-TR')}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Çıkış Yapılan</div>
              <div className="text-2xl font-bold text-slate-800">{reservation.issuedQuantity.toLocaleString('tr-TR')}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Karşılama</div>
              <div className="mb-2">
                <Progress
                  percent={percent}
                  size="small"
                  strokeColor="#475569"
                  trailColor="#e2e8f0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rezervasyon Bilgileri</h2>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Rezervasyon No">{reservation.reservationNumber}</Descriptions.Item>
            <Descriptions.Item label="Üretim Emri">{reservation.productionOrderNumber}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Malzeme">{reservation.productName}</Descriptions.Item>
            <Descriptions.Item label="Malzeme Kodu">{reservation.productCode}</Descriptions.Item>
            <Descriptions.Item label="Öncelik">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: priorityInfo.bgColor, color: priorityInfo.color }}
              >
                {priorityInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Depo">{reservation.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="Gerekli Tarih">
              {reservation.requiredDate ? dayjs(reservation.requiredDate).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Lot No">{reservation.lotNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Not" span={3}>
              {reservation.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Allocations */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tahsisler</h2>
          <Table
            columns={allocationColumns}
            dataSource={reservation.allocations || []}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Henüz tahsis yapılmamış"
                />
              ),
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
          />
        </div>

        {/* Issues */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Malzeme Çıkışları</h2>
          <Table
            columns={issueColumns}
            dataSource={reservation.issues || []}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Henüz çıkış yapılmamış"
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
