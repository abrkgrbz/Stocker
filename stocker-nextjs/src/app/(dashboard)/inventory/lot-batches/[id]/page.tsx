'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Modal,
  Empty,
  Progress,
  Alert,
  Input,
  Form,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  StopCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useLotBatch,
  useApproveLotBatch,
  useQuarantineLotBatch,
} from '@/lib/api/hooks/useInventory';
import { LotBatchStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<
  LotBatchStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  [LotBatchStatus.Pending]: {
    label: 'Beklemede',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <ExclamationCircleIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Received]: {
    label: 'Alındı',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <InboxIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Approved]: {
    label: 'Onaylandı',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Quarantined]: {
    label: 'Karantinada',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <StopCircleIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Rejected]: {
    label: 'Reddedildi',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <StopCircleIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Exhausted]: {
    label: 'Tükendi',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <InboxIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Expired]: {
    label: 'Süresi Doldu',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  [LotBatchStatus.Recalled]: {
    label: 'Geri Çağrıldı',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
};

export default function LotBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lotBatchId = Number(params.id);

  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState('');

  const { data: lotBatch, isLoading } = useLotBatch(lotBatchId);
  const approveLotBatch = useApproveLotBatch();
  const quarantineLotBatch = useQuarantineLotBatch();

  const handleApprove = async () => {
    try {
      await approveLotBatch.mutateAsync(lotBatchId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleQuarantine = async () => {
    if (!quarantineReason.trim()) return;
    try {
      await quarantineLotBatch.mutateAsync({
        id: lotBatchId,
        request: { reason: quarantineReason },
      });
      setQuarantineModalOpen(false);
      setQuarantineReason('');
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lotBatch) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Lot/Parti bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[lotBatch.status];
  const usagePercentage =
    lotBatch.initialQuantity > 0
      ? Math.round(
          ((lotBatch.initialQuantity - lotBatch.currentQuantity) / lotBatch.initialQuantity) * 100
        )
      : 0;

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-amber-600';
    return 'text-emerald-600';
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{lotBatch.lotNumber}</h1>
                  <Tag
                    icon={statusInfo.icon}
                    className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.label}
                  </Tag>
                  {lotBatch.isQuarantined && (
                    <Tag className="border-0 bg-red-50 text-red-700">Karantina</Tag>
                  )}
                  {lotBatch.isExpired && (
                    <Tag className="border-0 bg-slate-100 text-slate-600">Süresi Doldu</Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {lotBatch.productName} ({lotBatch.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            {lotBatch.status === 'Pending' && (
              <Button
                type="primary"
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveLotBatch.isPending}
                style={{ background: '#1e293b', borderColor: '#1e293b' }}
              >
                Onayla
              </Button>
            )}
            {lotBatch.status === 'Approved' && !lotBatch.isQuarantined && (
              <Button danger icon={<StopCircleIcon className="w-4 h-4" />} onClick={() => setQuarantineModalOpen(true)}>
                Karantinaya Al
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Alerts */}
        {lotBatch.isExpired && (
          <Alert
            message="Son Kullanma Tarihi Geçmiş"
            description="Bu lot/parti'nin son kullanma tarihi geçmiştir."
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {lotBatch.daysUntilExpiry !== undefined &&
          lotBatch.daysUntilExpiry > 0 &&
          lotBatch.daysUntilExpiry <= 30 && (
            <Alert
              message={`Son kullanma tarihine ${lotBatch.daysUntilExpiry} gün kaldı`}
              type="warning"
              showIcon
              className="mb-6"
            />
          )}

        {lotBatch.isQuarantined && (
          <Alert
            message="Karantinada"
            description={lotBatch.quarantineReason || 'Bu lot karantinaya alınmış durumda.'}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Başlangıç
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{lotBatch.initialQuantity}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mevcut</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-blue-600">{lotBatch.currentQuantity}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rezerve</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-amber-600">
                  {lotBatch.reservedQuantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kullanılabilir
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">
                  {lotBatch.availableQuantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          {/* Lot Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Lot Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lot Numarası</p>
                  <p className="text-sm font-medium text-slate-900">{lotBatch.lotNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={statusInfo.icon}
                    className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ürün</p>
                  <button
                    onClick={() => router.push(`/inventory/products/${lotBatch.productId}`)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {lotBatch.productName}
                  </button>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ürün Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{lotBatch.productCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tedarikçi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {lotBatch.supplierName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tedarikçi Lot No</p>
                  <p className="text-sm font-medium text-slate-900">
                    {lotBatch.supplierLotNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sertifika No</p>
                  <p className="text-sm font-medium text-slate-900">
                    {lotBatch.certificateNumber || '-'}
                  </p>
                </div>
                {lotBatch.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Notlar</p>
                    <p className="text-sm text-slate-600">{lotBatch.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Progress Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kullanım Durumu
              </p>
              <div className="flex items-center gap-6 mb-6">
                <Progress
                  type="circle"
                  percent={usagePercentage}
                  size={100}
                  strokeColor={usagePercentage >= 90 ? '#ef4444' : usagePercentage >= 70 ? '#f59e0b' : '#10b981'}
                  format={(percent) => (
                    <span className={`text-lg font-bold ${getUsageColor(percent || 0)}`}>
                      %{percent}
                    </span>
                  )}
                />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Başlangıç</span>
                    <span className="text-sm font-medium text-slate-900">
                      {lotBatch.initialQuantity} adet
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Kullanılan</span>
                    <span className="text-sm font-medium text-red-600">
                      {lotBatch.initialQuantity - lotBatch.currentQuantity} adet
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Kalan</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {lotBatch.currentQuantity} adet
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Mevcut</p>
                  <p className="text-2xl font-bold text-slate-900">{lotBatch.currentQuantity}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Rezerve</p>
                  <p className="text-2xl font-bold text-amber-600">{lotBatch.reservedQuantity}</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Kullanılabilir</p>
                  <p className="text-2xl font-bold text-emerald-600">{lotBatch.availableQuantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Tarihler
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Üretim Tarihi</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {lotBatch.manufacturedDate
                      ? dayjs(lotBatch.manufacturedDate).format('DD/MM/YYYY')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Alım Tarihi</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {lotBatch.receivedDate
                      ? dayjs(lotBatch.receivedDate).format('DD/MM/YYYY')
                      : '-'}
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className={`w-4 h-4 ${lotBatch.isExpired ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="text-sm text-slate-500">Son Kullanma</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${lotBatch.isExpired ? 'text-red-600' : 'text-slate-900'}`}
                  >
                    {lotBatch.expiryDate ? dayjs(lotBatch.expiryDate).format('DD/MM/YYYY') : '-'}
                  </span>
                </div>
                {lotBatch.daysUntilExpiry !== undefined && lotBatch.daysUntilExpiry > 0 && (
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-slate-500">Kalan Süre</p>
                    <p className="text-2xl font-bold text-amber-600">{lotBatch.daysUntilExpiry} gün</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quarantine Info Section */}
          {lotBatch.isQuarantined && (
            <div className="col-span-12 md:col-span-4">
              <div className="bg-white border border-red-200 rounded-xl p-6 h-full">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">
                  Karantina Bilgileri
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Karantina Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">
                      {lotBatch.quarantinedDate
                        ? dayjs(lotBatch.quarantinedDate).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sebep</p>
                    <p className="text-sm text-red-600">{lotBatch.quarantineReason || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inspection Info Section */}
          {lotBatch.inspectedDate && (
            <div className="col-span-12 md:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Denetim Bilgileri
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Denetim Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(lotBatch.inspectedDate).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                  {lotBatch.inspectionNotes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Denetim Notları</p>
                      <p className="text-sm text-slate-600">{lotBatch.inspectionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(lotBatch.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quarantine Modal */}
      <Modal
        title="Karantinaya Al"
        open={quarantineModalOpen}
        onCancel={() => {
          setQuarantineModalOpen(false);
          setQuarantineReason('');
        }}
        onOk={handleQuarantine}
        okText="Karantinaya Al"
        cancelText="İptal"
        okButtonProps={{
          danger: true,
          loading: quarantineLotBatch.isPending,
          disabled: !quarantineReason.trim(),
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Karantina Sebebi"
            required
            help="Bu lot/parti neden karantinaya alınıyor?"
          >
            <TextArea
              rows={3}
              value={quarantineReason}
              onChange={(e) => setQuarantineReason(e.target.value)}
              placeholder="Karantina sebebini açıklayın..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
