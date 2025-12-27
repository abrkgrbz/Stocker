'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Dropdown,
  Steps,
  Modal,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  InboxIcon,
  PencilIcon,
  PrinterIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useGoodsReceipt,
  useCompleteGoodsReceipt,
  useCancelGoodsReceipt,
  usePassQualityCheck,
  useFailQualityCheck,
} from '@/lib/api/hooks/usePurchase';
import type { GoodsReceiptStatus, GoodsReceiptItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusColors: Record<GoodsReceiptStatus, string> = {
  Draft: 'default',
  Pending: 'orange',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<GoodsReceiptStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Confirmed: 'Onaylandi',
  Completed: 'Tamamlandi',
  Cancelled: 'Iptal Edildi',
};

const getStatusStep = (status: GoodsReceiptStatus): number => {
  const steps: Record<GoodsReceiptStatus, number> = {
    Draft: 0,
    Pending: 1,
    Confirmed: 2,
    Completed: 3,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

const conditionColors: Record<string, string> = {
  Good: 'green',
  Damaged: 'red',
  Defective: 'orange',
  Expired: 'volcano',
  Other: 'default',
};

const conditionLabels: Record<string, string> = {
  Good: 'Iyi',
  Damaged: 'Hasarli',
  Defective: 'Kusurlu',
  Expired: 'Vadesi Gecmis',
  Other: 'Diger',
};

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const { data: receipt, isLoading } = useGoodsReceipt(receiptId);
  const completeReceipt = useCompleteGoodsReceipt();
  const cancelReceipt = useCancelGoodsReceipt();
  const passQC = usePassQualityCheck();
  const failQC = useFailQualityCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Mal alim belgesi bulunamadi</h2>
        <p className="text-sm text-slate-500 mb-4">Bu belge silinmis veya erisim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/goods-receipts')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Mal Alim Belgelerine Don
        </button>
      </div>
    );
  }

  const handleComplete = () => {
    completeReceipt.mutate(receiptId);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Belgeyi Iptal Et',
      content: 'Bu mal alim belgesini iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => cancelReceipt.mutate({ id: receiptId, reason: 'Manuel iptal' }),
    });
  };

  const handlePassQC = () => {
    passQC.mutate({ id: receiptId });
  };

  const handleFailQC = () => {
    Modal.confirm({
      title: 'Kalite Kontrol Basarisiz',
      content: 'Kalite kontrolu basarisiz olarak isaretlemek istediginizden emin misiniz?',
      okText: 'Basarisiz',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => failQC.mutate({ id: receiptId, reason: 'Kalite standartlarini karsilamiyor' }),
    });
  };

  const actionMenuItems = [
    receipt.status === 'Confirmed' && {
      key: 'complete',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Tamamla',
      onClick: handleComplete,
    },
    receipt.requiresQualityCheck && !receipt.qualityCheckDate && {
      key: 'passQC',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      label: 'Kalite Kontrol Gecti',
      onClick: handlePassQC,
    },
    receipt.requiresQualityCheck && !receipt.qualityCheckDate && {
      key: 'failQC',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Kalite Kontrol Basarisiz',
      danger: true,
      onClick: handleFailQC,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdir',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed'].includes(receipt.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Iptal Et',
      danger: true,
      onClick: handleCancel,
    },
  ].filter(Boolean) as MenuProps['items'];

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <span className="text-sm text-slate-500">{index + 1}</span>
      ),
    },
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: GoodsReceiptItemDto) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Siparis Miktari',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => (
        <span className="text-sm text-slate-900">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Alinan Miktar',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => (
        <span className="text-sm font-medium text-emerald-600">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Kabul Edilen',
      dataIndex: 'acceptedQuantity',
      key: 'acceptedQuantity',
      align: 'center' as const,
      render: (qty: number, record: GoodsReceiptItemDto) => (
        <span className="text-sm text-slate-900">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Reddedilen',
      dataIndex: 'rejectedQuantity',
      key: 'rejectedQuantity',
      align: 'center' as const,
      render: (qty: number) => qty > 0 ? (
        <span className="text-sm text-red-600">{qty}</span>
      ) : <span className="text-sm text-slate-400">-</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'condition',
      key: 'condition',
      align: 'center' as const,
      render: (condition: string) => (
        <Tag color={conditionColors[condition] || 'default'}>
          {conditionLabels[condition] || condition}
        </Tag>
      ),
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      render: (lot: string) => (
        <span className="text-sm text-slate-900">{lot || '-'}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/goods-receipts')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900">{receipt.receiptNumber}</h1>
                    <Tag color={statusColors[receipt.status as GoodsReceiptStatus]}>
                      {statusLabels[receipt.status as GoodsReceiptStatus]}
                    </Tag>
                  </div>
                  <p className="text-sm text-slate-500">
                    {receipt.supplierName} - {dayjs(receipt.receiptDate).format('DD.MM.YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                  Islemler
                </button>
              </Dropdown>
              {receipt.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/goods-receipts/${receiptId}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Duzenle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <Steps
            current={getStatusStep(receipt.status as GoodsReceiptStatus)}
            status={receipt.status === 'Cancelled' ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
              { title: 'Beklemede' },
              { title: 'Onaylandi', icon: <CheckCircleIcon className="w-4 h-4" /> },
              { title: 'Tamamlandi', icon: <CheckCircleIcon className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <Statistic
                title={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Kalem</span>}
                value={(receipt.items || []).length}
                suffix="adet"
                valueStyle={{ color: '#0f172a', fontSize: '24px', fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <Statistic
                title={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Paket</span>}
                value={receipt.totalPackages || 0}
                suffix="paket"
                valueStyle={{ color: '#0f172a', fontSize: '24px', fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <Statistic
                title={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Agirlik</span>}
                value={receipt.totalWeight || 0}
                precision={2}
                suffix="kg"
                valueStyle={{ color: '#0f172a', fontSize: '24px', fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <Statistic
                title={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kalite Kontrol</span>}
                value={receipt.requiresQualityCheck ? (receipt.qualityCheckDate ? 'Tamamlandi' : 'Bekliyor') : 'Gerekli Degil'}
                valueStyle={{
                  color: receipt.requiresQualityCheck
                    ? (receipt.qualityCheckDate ? '#10b981' : '#f59e0b')
                    : '#64748b',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Receipt Items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Alinan Kalemler</h2>
              </div>
              <Table
                dataSource={receipt.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>

            {/* Notes */}
            {(receipt.notes || receipt.qualityNotes) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Notlar</h2>
                {receipt.notes && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Genel Not</span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{receipt.notes}</p>
                  </div>
                )}
                {receipt.qualityNotes && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Kalite Kontrol Notu</span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{receipt.qualityNotes}</p>
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Tedarikci Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tedarikci</span>
                  <button
                    onClick={() => router.push(`/purchase/suppliers/${receipt.supplierId}`)}
                    className="text-sm font-medium text-slate-900 hover:text-slate-700"
                  >
                    {receipt.supplierName}
                  </button>
                </div>
                {receipt.purchaseOrderNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Siparis No</span>
                    <button
                      onClick={() => router.push(`/purchase/orders/${receipt.purchaseOrderId}`)}
                      className="text-sm font-medium text-slate-900 hover:text-slate-700"
                    >
                      {receipt.purchaseOrderNumber}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Belge Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Belge No</span>
                  <span className="text-sm font-medium text-slate-900">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tarih</span>
                  <span className="text-sm text-slate-900">{dayjs(receipt.receiptDate).format('DD.MM.YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tip</span>
                  <span className="text-sm text-slate-900">{receipt.type}</span>
                </div>
                {receipt.warehouseName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Depo</span>
                    <span className="text-sm text-slate-900">{receipt.warehouseName}</span>
                  </div>
                )}
                {receipt.deliveryNoteNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Irsaliye No</span>
                    <span className="text-sm text-slate-900">{receipt.deliveryNoteNumber}</span>
                  </div>
                )}
                {receipt.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Teslim Tarihi</span>
                    <span className="text-sm text-slate-900">{dayjs(receipt.deliveryDate).format('DD.MM.YYYY')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            {(receipt.carrierName || receipt.driverName || receipt.vehiclePlate) && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Tasima Bilgileri</h3>
                <div className="space-y-3">
                  {receipt.carrierName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Tasiyici</span>
                      <span className="text-sm text-slate-900">{receipt.carrierName}</span>
                    </div>
                  )}
                  {receipt.driverName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Sofor</span>
                      <span className="text-sm text-slate-900">{receipt.driverName}</span>
                    </div>
                  )}
                  {receipt.vehiclePlate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Plaka</span>
                      <span className="text-sm text-slate-900">{receipt.vehiclePlate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Check Info */}
            {receipt.requiresQualityCheck && receipt.qualityCheckDate && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Kalite Kontrol</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Kontrol Tarihi</span>
                    <span className="text-sm text-slate-900">{dayjs(receipt.qualityCheckDate).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                  {receipt.qualityCheckedByName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Kontrol Eden</span>
                      <span className="text-sm text-slate-900">{receipt.qualityCheckedByName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
