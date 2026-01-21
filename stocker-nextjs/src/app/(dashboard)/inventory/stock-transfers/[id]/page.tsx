'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Table, Tag, Empty, Timeline, Progress, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  EyeIcon,
  InboxIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  RocketLaunchIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useStockTransfer,
  useSubmitStockTransfer,
  useApproveStockTransfer,
  useShipStockTransfer,
  useReceiveStockTransfer,
  useCancelStockTransfer,
} from '@/lib/api/hooks/useInventory';
import type { TransferStatus, StockTransferItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<
  TransferStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  Draft: {
    label: 'Taslak',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <PencilIcon className="w-4 h-4" />,
  },
  Pending: {
    label: 'Beklemede',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <ClockIcon className="w-4 h-4" />,
  },
  Approved: {
    label: 'Onaylı',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  Rejected: {
    label: 'Reddedildi',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
  InTransit: {
    label: 'Yolda',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <RocketLaunchIcon className="w-4 h-4" />,
  },
  Received: {
    label: 'Teslim Alındı',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    icon: <InboxIcon className="w-4 h-4" />,
  },
  PartiallyReceived: {
    label: 'Kısmi Teslim',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: <InboxIcon className="w-4 h-4" />,
  },
  Completed: {
    label: 'Tamamlandı',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  Cancelled: {
    label: 'İptal',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
};

const transferTypeLabels: Record<string, string> = {
  Standard: 'Standart',
  Urgent: 'Acil',
  Replenishment: 'İkmal',
  Return: 'İade',
  Internal: 'Dahili',
  CrossDock: 'Cross-Dock',
  Consolidation: 'Konsolidasyon',
};

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: transfer, isLoading, error } = useStockTransfer(id);
  const submitTransfer = useSubmitStockTransfer();
  const approveTransfer = useApproveStockTransfer();
  const shipTransfer = useShipStockTransfer();
  const receiveTransfer = useReceiveStockTransfer();
  const cancelTransfer = useCancelStockTransfer();

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Transferi Gönder',
      icon: <ExclamationCircleFilled />,
      content: 'Bu transferi onaya göndermek istediğinizden emin misiniz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: async () => {
        await submitTransfer.mutateAsync(id);
      },
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Transferi Onayla',
      icon: <ExclamationCircleFilled />,
      content: 'Bu transferi onaylamak istediğinizden emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        await approveTransfer.mutateAsync({ id, approvedByUserId: 1 });
      },
    });
  };

  const handleShip = () => {
    Modal.confirm({
      title: 'Transferi Sevk Et',
      icon: <ExclamationCircleFilled />,
      content: 'Bu transferi sevk etmek istediğinizden emin misiniz?',
      okText: 'Sevk Et',
      cancelText: 'İptal',
      onOk: async () => {
        await shipTransfer.mutateAsync({ id, shippedByUserId: 1 });
      },
    });
  };

  const handleReceive = () => {
    Modal.confirm({
      title: 'Transferi Teslim Al',
      icon: <ExclamationCircleFilled />,
      content: 'Bu transferi teslim almak istediğinizden emin misiniz?',
      okText: 'Teslim Al',
      cancelText: 'İptal',
      onOk: async () => {
        await receiveTransfer.mutateAsync({ id, receivedByUserId: 1 });
      },
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Transferi İptal Et',
      icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
      content: 'Bu transferi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        await cancelTransfer.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Transfer bilgileri yüklenemedi" />
      </div>
    );
  }

  const config = statusConfig[transfer.status];

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    switch (transfer.status) {
      case 'Draft':
        buttons.push(
          <Button
            key="submit"
            type="primary"
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            onClick={handleSubmit}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Onaya Gönder
          </Button>,
          <Button key="cancel" danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleCancel}>
            İptal Et
          </Button>
        );
        break;
      case 'Pending':
        buttons.push(
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={handleApprove}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Onayla
          </Button>,
          <Button key="reject" danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleCancel}>
            Reddet
          </Button>
        );
        break;
      case 'Approved':
        buttons.push(
          <Button
            key="ship"
            type="primary"
            icon={<RocketLaunchIcon className="w-4 h-4" />}
            onClick={handleShip}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Sevk Et
          </Button>
        );
        break;
      case 'InTransit':
        buttons.push(
          <Button
            key="receive"
            type="primary"
            icon={<InboxIcon className="w-4 h-4" />}
            onClick={handleReceive}
            style={{ background: '#1e293b', borderColor: '#1e293b' }}
          >
            Teslim Al
          </Button>
        );
        break;
    }

    return buttons;
  };

  const itemColumns: ColumnsType<StockTransferItemDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (code) => <span className="font-medium text-slate-900">{code}</span>,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <span className="text-slate-700">{name}</span>,
    },
    {
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationName',
      key: 'sourceLocationName',
      width: 140,
      render: (name) => name || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationName',
      key: 'destinationLocationName',
      width: 140,
      render: (name) => name || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Talep',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 80,
      align: 'right',
      render: (qty) => <span className="font-medium text-slate-900">{qty}</span>,
    },
    {
      title: 'Sevk',
      dataIndex: 'shippedQuantity',
      key: 'shippedQuantity',
      width: 80,
      align: 'right',
      render: (qty, record) => (
        <span className={qty < record.requestedQuantity ? 'text-amber-600' : 'text-emerald-600'}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Teslim',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 80,
      align: 'right',
      render: (qty, record) => (
        <span className={qty < record.shippedQuantity ? 'text-amber-600' : 'text-emerald-600'}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Hasarlı',
      dataIndex: 'damagedQuantity',
      key: 'damagedQuantity',
      width: 80,
      align: 'right',
      render: (qty) =>
        qty > 0 ? (
          <span className="text-red-600 font-medium">{qty}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 100,
      render: (lot) => lot || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 100,
      render: (serial) => serial || <span className="text-slate-400">-</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeIcon className="w-4 h-4" />}
          onClick={() => router.push(`/inventory/products/${record.productId}`)}
          className="text-slate-500 hover:text-blue-600"
          title="Ürün Detayı"
        />
      ),
    },
  ];

  const completionPercent =
    transfer.totalRequestedQuantity > 0
      ? Math.round((transfer.totalReceivedQuantity / transfer.totalRequestedQuantity) * 100)
      : 0;

  const shippedPercent =
    transfer.totalRequestedQuantity > 0
      ? Math.round((transfer.totalShippedQuantity / transfer.totalRequestedQuantity) * 100)
      : 0;

  const getTimelineItems = () => {
    const items: { children: React.ReactNode; color: string }[] = [
      {
        color: 'green',
        children: (
          <div>
            <p className="text-sm font-medium text-slate-900">Oluşturuldu</p>
            <p className="text-xs text-slate-500">
              {dayjs(transfer.createdAt).format('DD/MM/YYYY HH:mm')}
            </p>
          </div>
        ),
      },
    ];

    if (transfer.shippedDate) {
      items.push({
        color: 'blue',
        children: (
          <div>
            <p className="text-sm font-medium text-slate-900">Sevk Edildi</p>
            <p className="text-xs text-slate-500">
              {dayjs(transfer.shippedDate).format('DD/MM/YYYY HH:mm')}
            </p>
          </div>
        ),
      });
    }

    if (transfer.receivedDate) {
      items.push({
        color: 'cyan',
        children: (
          <div>
            <p className="text-sm font-medium text-slate-900">Teslim Alındı</p>
            <p className="text-xs text-slate-500">
              {dayjs(transfer.receivedDate).format('DD/MM/YYYY HH:mm')}
            </p>
          </div>
        ),
      });
    }

    if (transfer.completedDate) {
      items.push({
        color: 'green',
        children: (
          <div>
            <p className="text-sm font-medium text-slate-900">Tamamlandı</p>
            <p className="text-xs text-slate-500">
              {dayjs(transfer.completedDate).format('DD/MM/YYYY HH:mm')}
            </p>
          </div>
        ),
      });
    }

    if (transfer.cancelledDate) {
      items.push({
        color: 'red',
        children: (
          <div>
            <p className="text-sm font-medium text-slate-900">İptal Edildi</p>
            <p className="text-xs text-slate-500">
              {dayjs(transfer.cancelledDate).format('DD/MM/YYYY HH:mm')}
            </p>
            {transfer.cancellationReason && (
              <p className="text-xs text-red-600 mt-1">Neden: {transfer.cancellationReason}</p>
            )}
          </div>
        ),
      });
    }

    return items;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'text-emerald-600';
    if (percent >= 50) return 'text-blue-600';
    return 'text-slate-600';
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
                <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {transfer.transferNumber}
                  </h1>
                  <Tag
                    icon={config.icon}
                    className={`border-0 ${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {transferTypeLabels[transfer.transferType] || transfer.transferType}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Yazdır
            </Button>
            {getActionButtons()}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
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
                  Talep Edilen
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {transfer.totalRequestedQuantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sevk Edilen
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {transfer.totalShippedQuantity}
                </span>
                <span className="text-sm text-slate-400">%{shippedPercent}</span>
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
                  Teslim Alınan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">
                  {transfer.totalReceivedQuantity}
                </span>
                <span className="text-sm text-slate-400">%{completionPercent}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fark</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-red-600">
                  {transfer.totalRequestedQuantity - transfer.totalReceivedQuantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          {/* Warehouse Info Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kaynak Depo
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <button
                    onClick={() =>
                      router.push(`/inventory/warehouses/${transfer.sourceWarehouseId}`)
                    }
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {transfer.sourceWarehouseName}
                  </button>
                  <p className="text-sm text-slate-500">Çıkış deposu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Hedef Depo
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <button
                    onClick={() =>
                      router.push(`/inventory/warehouses/${transfer.destinationWarehouseId}`)
                    }
                    className="text-lg font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    {transfer.destinationWarehouseName}
                  </button>
                  <p className="text-sm text-slate-500">Varış deposu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Details Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Transfer Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Transfer Numarası</p>
                  <p className="text-sm font-medium text-slate-900">{transfer.transferNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Transfer Türü</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
                    {transferTypeLabels[transfer.transferType] || transfer.transferType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Transfer Tarihi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dayjs(transfer.transferDate).format('DD/MM/YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tahmini Varış</p>
                  <p className="text-sm font-medium text-slate-900">
                    {transfer.expectedArrivalDate
                      ? dayjs(transfer.expectedArrivalDate).format('DD/MM/YYYY')
                      : '-'}
                  </p>
                </div>
                {transfer.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{transfer.description}</p>
                  </div>
                )}
                {transfer.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Notlar</p>
                    <p className="text-sm text-slate-600">{transfer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress & Timeline Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İlerleme Durumu
              </p>
              <div className="flex items-center gap-6 mb-6">
                <Progress
                  type="circle"
                  percent={completionPercent}
                  size={100}
                  strokeColor="#10b981"
                  format={(percent) => (
                    <span className={`text-lg font-bold ${getProgressColor(percent || 0)}`}>
                      %{percent}
                    </span>
                  )}
                />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Talep</span>
                    <span className="text-sm font-medium text-slate-900">
                      {transfer.totalRequestedQuantity} adet
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Sevk</span>
                    <span className="text-sm font-medium text-blue-600">
                      {transfer.totalShippedQuantity} adet
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Teslim</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {transfer.totalReceivedQuantity} adet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Transfer Geçmişi
              </p>
              <Timeline items={getTimelineItems()} />
            </div>
          </div>

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
                    {dayjs(transfer.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {transfer.createdAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(transfer.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reference Document Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Referans Belge
              </p>
              {transfer.transferNumber ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{transfer.transferNumber}</p>
                    <p className="text-xs text-slate-500">Referans No</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Referans belge yok</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Transfer Kalemleri
                </p>
                <span className="text-sm text-slate-500">
                  {transfer.items?.length || 0} kalem
                </span>
              </div>
              <Table
                columns={itemColumns}
                dataSource={transfer.items || []}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1000 }}
                className="stock-transfer-items-table"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-50">
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <span className="font-semibold text-slate-900">Toplam</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="font-semibold text-slate-900">
                          {transfer.totalRequestedQuantity}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="font-semibold text-blue-600">
                          {transfer.totalShippedQuantity}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <span className="font-semibold text-emerald-600">
                          {transfer.totalReceivedQuantity}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} colSpan={3} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
