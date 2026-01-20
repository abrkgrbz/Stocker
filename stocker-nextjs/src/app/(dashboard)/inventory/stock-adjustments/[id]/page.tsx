'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Modal,
  Empty,
  Table,
  Input,
  Form,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useInventoryAdjustment,
  useApproveInventoryAdjustment,
  useRejectInventoryAdjustment,
} from '@/lib/api/hooks/useInventory';
import type { InventoryAdjustmentItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  Draft: {
    label: 'Taslak',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    icon: <DocumentTextIcon className="w-4 h-4" />,
  },
  PendingApproval: {
    label: 'Onay Bekliyor',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <ExclamationCircleIcon className="w-4 h-4" />,
  },
  Approved: {
    label: 'Onaylandı',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  Rejected: {
    label: 'Reddedildi',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
  Processed: {
    label: 'İşlendi',
    bgColor: 'bg-slate-200',
    textColor: 'text-slate-900',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  Cancelled: {
    label: 'İptal',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    icon: <XCircleIcon className="w-4 h-4" />,
  },
};

const adjustmentTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Increase: {
    label: 'Artış',
    icon: <PlusCircleIcon className="w-4 h-4" />,
    color: 'text-emerald-600',
  },
  Decrease: {
    label: 'Azalış',
    icon: <MinusCircleIcon className="w-4 h-4" />,
    color: 'text-red-600',
  },
  Correction: {
    label: 'Düzeltme',
    icon: <ArrowPathIcon className="w-4 h-4" />,
    color: 'text-blue-600',
  },
  Scrap: {
    label: 'Fire',
    icon: <MinusCircleIcon className="w-4 h-4" />,
    color: 'text-orange-600',
  },
  InternalTransfer: {
    label: 'Dahili Transfer',
    icon: <ArrowPathIcon className="w-4 h-4" />,
    color: 'text-purple-600',
  },
};

const reasonLabels: Record<string, string> = {
  StockCountVariance: 'Sayım Farkı',
  Damage: 'Hasar',
  Loss: 'Kayıp',
  Theft: 'Hırsızlık',
  ProductionScrap: 'Üretim Fire',
  Expired: 'Son Kullanma Tarihi',
  QualityRejection: 'Kalite Reddi',
  CustomerReturn: 'Müşteri İadesi',
  SupplierReturn: 'Tedarikçi İadesi',
  SystemCorrection: 'Sistem Düzeltmesi',
  OpeningStock: 'Açılış Stoğu',
  Other: 'Diğer',
};

export default function StockAdjustmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const adjustmentId = Number(params.id);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  const { data: adjustment, isLoading } = useInventoryAdjustment(adjustmentId);
  const approveAdjustment = useApproveInventoryAdjustment();
  const rejectAdjustment = useRejectInventoryAdjustment();

  const handleApprove = async () => {
    try {
      await approveAdjustment.mutateAsync({
        id: adjustmentId,
        data: { approvedBy: 'CurrentUser' },
      });
    } catch {
      // Error handled
    }
  };

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      await rejectAdjustment.mutateAsync({
        id: adjustmentId,
        data: { rejectedBy: 'CurrentUser', reason: values.reason },
      });
      setRejectModalOpen(false);
      rejectForm.resetFields();
    } catch {
      // Error handled
    }
  };

  const itemColumns: ColumnsType<InventoryAdjustmentItemDto> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record) => (
        <div>
          <p className="text-sm font-medium text-slate-900 m-0">{text}</p>
          <p className="text-xs text-slate-500 m-0">{record.productCode}</p>
        </div>
      ),
    },
    {
      title: 'Sistem Miktarı',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-slate-600">
          {val}
        </span>
      ),
    },
    {
      title: 'Fiili Miktar',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm font-medium text-slate-900">
          {val}
        </span>
      ),
    },
    {
      title: 'Fark',
      dataIndex: 'varianceQuantity',
      key: 'varianceQuantity',
      align: 'right',
      render: (val: number) => {
        const isPositive = val > 0;
        const isNegative = val < 0;
        return (
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'
            }`}
          >
            {isPositive ? '+' : ''}{val}
          </span>
        );
      },
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-slate-600">
          {val?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Maliyet Etkisi',
      dataIndex: 'costImpact',
      key: 'costImpact',
      align: 'right',
      render: (val: number) => {
        const isPositive = val > 0;
        const isNegative = val < 0;
        return (
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'
            }`}
          >
            {isPositive ? '+' : ''}{val?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </span>
        );
      },
    },
    {
      title: 'Lot/Seri No',
      key: 'lotSerial',
      render: (_, record) => (
        <div className="text-xs text-slate-500">
          {record.lotNumber && <div>Lot: {record.lotNumber}</div>}
          {record.serialNumber && <div>Seri: {record.serialNumber}</div>}
          {!record.lotNumber && !record.serialNumber && '-'}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Stok düzeltmesi bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[adjustment.status] || statusConfig.Draft;
  const typeInfo = adjustmentTypeConfig[adjustment.adjustmentType] || adjustmentTypeConfig.Correction;
  const canApprove = adjustment.status === 'PendingApproval';
  const canEdit = adjustment.status === 'Draft';

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
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {adjustment.adjustmentNumber}
                  </h1>
                  <Tag
                    icon={statusInfo.icon}
                    className={`border-0 ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  <span className={typeInfo.color}>{typeInfo.label}</span> • {adjustment.warehouseName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            {canEdit && (
              <Button
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/inventory/stock-adjustments/${adjustmentId}/edit`)}
              >
                Düzenle
              </Button>
            )}
            {canApprove && (
              <>
                <Button danger onClick={() => setRejectModalOpen(true)}>
                  Reddet
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={handleApprove}
                  loading={approveAdjustment.isPending}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Onayla
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Rejection Info */}
        {adjustment.status === 'Rejected' && adjustment.rejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
              Ret Sebebi
            </p>
            <p className="text-sm text-red-700 m-0">{adjustment.rejectionReason}</p>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  adjustment.adjustmentType === 'Increase' ? 'bg-emerald-100' :
                  adjustment.adjustmentType === 'Decrease' ? 'bg-red-100' : 'bg-slate-100'
                }`}>
                  {typeInfo.icon}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Düzeltme Tipi
                </p>
              </div>
              <div className={`text-2xl font-bold ${typeInfo.color}`}>
                {typeInfo.label}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kalem Sayısı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {adjustment.items?.length || 0}
                </span>
                <span className="text-sm text-slate-400">ürün</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  adjustment.totalCostImpact >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {adjustment.totalCostImpact >= 0 ? (
                    <PlusCircleIcon className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <MinusCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Maliyet Etkisi
                </p>
              </div>
              <div className={`text-2xl font-bold ${
                adjustment.totalCostImpact >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {adjustment.totalCostImpact >= 0 ? '+' : ''}
                {adjustment.totalCostImpact?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {adjustment.currency}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Düzeltme Tarihi
                </p>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {dayjs(adjustment.adjustmentDate).format('DD/MM/YYYY')}
              </div>
            </div>
          </div>

          {/* Adjustment Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Düzeltme Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Düzeltme No</p>
                  <p className="text-sm font-medium text-slate-900">{adjustment.adjustmentNumber}</p>
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
                  <p className="text-xs text-slate-400 mb-1">Düzeltme Tipi</p>
                  <span className={`text-sm font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sebep</p>
                  <p className="text-sm font-medium text-slate-900">
                    {reasonLabels[adjustment.reason] || adjustment.reason}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Depo</p>
                  <p className="text-sm font-medium text-slate-900">{adjustment.warehouseName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lokasyon</p>
                  <p className="text-sm font-medium text-slate-900">
                    {adjustment.locationName || 'Tüm Depo'}
                  </p>
                </div>
                {adjustment.referenceNumber && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Referans No</p>
                    <p className="text-sm font-medium text-slate-900">{adjustment.referenceNumber}</p>
                  </div>
                )}
                {adjustment.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{adjustment.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approval Info Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Onay Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(adjustment.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {adjustment.approvedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Onaylayan</span>
                    <span className="text-sm font-medium text-slate-900">
                      {adjustment.approvedBy}
                    </span>
                  </div>
                )}
                {adjustment.approvedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Onay Tarihi</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(adjustment.approvedDate).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
                {adjustment.internalNotes && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Dahili Notlar</p>
                    <p className="text-sm text-slate-600">{adjustment.internalNotes}</p>
                  </div>
                )}
                {adjustment.accountingNotes && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Muhasebe Notları</p>
                    <p className="text-sm text-slate-600">{adjustment.accountingNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Düzeltme Kalemleri
              </p>
              <Table
                columns={itemColumns}
                dataSource={adjustment.items}
                rowKey="id"
                pagination={false}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!font-bold [&_.ant-table-thead_.ant-table-cell]:!text-slate-500 [&_.ant-table-thead_.ant-table-cell]:!uppercase [&_.ant-table-thead_.ant-table-cell]:!tracking-wider"
                summary={() => (
                  <Table.Summary.Row className="bg-slate-50 font-semibold">
                    <Table.Summary.Cell index={0} colSpan={4}>
                      Toplam
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">-</Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <span className={`${adjustment.totalCostImpact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {adjustment.totalCostImpact >= 0 ? '+' : ''}
                        {adjustment.totalCostImpact?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>-</Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        title="Düzeltmeyi Reddet"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        onOk={handleReject}
        okText="Reddet"
        cancelText="İptal"
        okButtonProps={{
          danger: true,
          loading: rejectAdjustment.isPending,
        }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Ret Sebebi"
            rules={[{ required: true, message: 'Ret sebebi zorunludur' }]}
          >
            <TextArea
              rows={3}
              placeholder="Düzeltmenin neden reddedildiğini açıklayın..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
