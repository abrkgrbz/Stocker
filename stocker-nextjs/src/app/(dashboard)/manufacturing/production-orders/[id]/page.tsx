'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Descriptions,
  Progress,
  Tag,
  Tabs,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  CalendarIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import {
  useProductionOrder,
  useDeleteProductionOrder,
  useStartProductionOrder,
  useCompleteProductionOrder,
  useCancelProductionOrder,
} from '@/lib/api/hooks/useManufacturing';
import type { ProductionOrderStatus, OrderPriority, ProductionOperationDto, MaterialRequirementDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// Status configuration
const statusConfig: Record<number, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  0: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Taslak', icon: <DocumentTextIcon className="w-3 h-3" /> },
  1: { color: '#64748b', bgColor: '#f1f5f9', label: 'Planlandı', icon: <ClockIcon className="w-3 h-3" /> },
  2: { color: '#475569', bgColor: '#e2e8f0', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  3: { color: '#334155', bgColor: '#cbd5e1', label: 'Serbest', icon: <PlayIcon className="w-3 h-3" /> },
  4: { color: '#1e293b', bgColor: '#94a3b8', label: 'Üretimde', icon: <CogIcon className="w-3 h-3" /> },
  5: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  6: { color: '#475569', bgColor: '#e2e8f0', label: 'Kapatıldı', icon: <StopIcon className="w-3 h-3" /> },
  7: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal', icon: <XMarkIcon className="w-3 h-3" /> },
};

// Priority configuration
const priorityConfig: Record<OrderPriority, { color: string; bgColor: string; label: string }> = {
  Low: { color: '#64748b', bgColor: '#f1f5f9', label: 'Düşük' },
  Normal: { color: '#475569', bgColor: '#e2e8f0', label: 'Normal' },
  High: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Yüksek' },
  Urgent: { color: '#dc2626', bgColor: '#fee2e2', label: 'Acil' },
};

export default function ProductionOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useProductionOrder(orderId);
  const deleteOrder = useDeleteProductionOrder();
  const startOrder = useStartProductionOrder();
  const completeOrder = useCompleteProductionOrder();
  const cancelOrder = useCancelProductionOrder();

  const handleDelete = async () => {
    if (!order) return;
    const confirmed = await confirmDelete('Üretim Emri', order.orderNumber);
    if (confirmed) {
      try {
        await deleteOrder.mutateAsync(orderId);
        router.push('/manufacturing/production-orders');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleStart = async () => {
    try {
      await startOrder.mutateAsync({ id: orderId, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async () => {
    if (!order) return;
    try {
      await completeOrder.mutateAsync({ id: orderId, data: { completedQuantity: order.plannedQuantity } });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync({ id: orderId, reason: 'İptal edildi' });
    } catch {
      // Error handled by hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Emir Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen üretim emri bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/production-orders')} className="!border-slate-300">
            Emirlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[order.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor', icon: null };
  const pConfig = priorityConfig[order.priority] || { color: '#64748b', bgColor: '#f1f5f9', label: order.priority };
  const progressPercent = order.plannedQuantity > 0 ? Math.round((order.completedQuantity / order.plannedQuantity) * 100) : 0;

  // Operations table columns
  const operationColumns: ColumnsType<ProductionOperationDto> = [
    {
      title: 'Operasyon No',
      dataIndex: 'operationNumber',
      key: 'operationNumber',
      width: 100,
      render: (num) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold">
          {num}
        </span>
      ),
    },
    {
      title: 'Operasyon',
      key: 'operation',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.operationName}</div>
          <div className="text-xs text-slate-500">{record.workCenterName}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Completed' ? 'success' : status === 'InProgress' ? 'processing' : 'default'}>
          {status === 'Completed' ? 'Tamamlandı' : status === 'InProgress' ? 'Devam Ediyor' : 'Beklemede'}
        </Tag>
      ),
    },
    {
      title: 'Planlanan',
      key: 'planned',
      width: 160,
      render: (_, record) => (
        record.plannedStartTime ? (
          <div className="text-sm">
            <div>{dayjs(record.plannedStartTime).format('DD.MM.YYYY HH:mm')}</div>
            <div className="text-xs text-slate-500">- {dayjs(record.plannedEndTime).format('HH:mm')}</div>
          </div>
        ) : '-'
      ),
    },
    {
      title: 'Gerçekleşen',
      key: 'actual',
      width: 160,
      render: (_, record) => (
        record.actualStartTime ? (
          <div className="text-sm">
            <div>{dayjs(record.actualStartTime).format('DD.MM.YYYY HH:mm')}</div>
            {record.actualEndTime && (
              <div className="text-xs text-slate-500">- {dayjs(record.actualEndTime).format('HH:mm')}</div>
            )}
          </div>
        ) : '-'
      ),
    },
    {
      title: 'Hazırlık/Çalışma',
      key: 'times',
      width: 130,
      render: (_, record) => (
        <div className="text-sm">
          <div>Hazırlık: {record.setupTime} dk</div>
          <div className="text-slate-500">Çalışma: {record.runTime} dk</div>
        </div>
      ),
    },
  ];

  // Material requirements table columns
  const materialColumns: ColumnsType<MaterialRequirementDto> = [
    {
      title: 'Malzeme',
      key: 'material',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.materialName}</div>
          <div className="text-xs text-slate-500">{record.materialCode}</div>
        </div>
      ),
    },
    {
      title: 'Gerekli',
      dataIndex: 'requiredQuantity',
      key: 'requiredQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <span className="font-semibold text-slate-900">{qty} {record.unitOfMeasure}</span>
      ),
    },
    {
      title: 'Ayrılan',
      dataIndex: 'allocatedQuantity',
      key: 'allocatedQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <span className="text-slate-600">{qty} {record.unitOfMeasure}</span>
      ),
    },
    {
      title: 'Çıkışı Yapılan',
      dataIndex: 'issuedQuantity',
      key: 'issuedQuantity',
      width: 120,
      align: 'right',
      render: (qty, record) => (
        <span className="text-slate-600">{qty} {record.unitOfMeasure}</span>
      ),
    },
    {
      title: 'Kalan',
      key: 'remaining',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const remaining = record.requiredQuantity - record.issuedQuantity;
        return (
          <span className={remaining > 0 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
            {remaining} {record.unitOfMeasure}
          </span>
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
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{order.orderNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.icon}
                  {sConfig.label}
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: pConfig.bgColor, color: pConfig.color }}
                >
                  {pConfig.label}
                </span>
              </div>
              <p className="text-sm text-slate-400 m-0">
                {order.productName} ({order.productCode})
              </p>
            </div>
          </div>
          <Space size="small">
            {order.status === 3 && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleStart}
                loading={startOrder.isPending}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Başlat
              </Button>
            )}
            {order.status === 4 && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleComplete}
                loading={completeOrder.isPending}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Tamamla
              </Button>
            )}
            {order.status < 5 && (
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelOrder.isPending}
                danger
              >
                İptal Et
              </Button>
            )}
            {order.status < 4 && (
              <Button
                icon={<PencilSquareIcon className="w-4 h-4" />}
                onClick={() => router.push(`/manufacturing/production-orders/${orderId}/edit`)}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Düzenle
              </Button>
            )}
            {order.status === 0 && (
              <Button
                danger
                icon={<TrashIcon className="w-4 h-4" />}
                onClick={handleDelete}
                loading={deleteOrder.isPending}
              >
                Sil
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* KPI Cards */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planlanan</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">{order.plannedQuantity}</span>
                <span className="text-sm text-slate-500 mb-1">{order.unitOfMeasure}</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tamamlanan</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">{order.completedQuantity}</span>
                <span className="text-sm text-slate-500 mb-1">{order.unitOfMeasure}</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fire</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-700">{order.scrapQuantity}</span>
                <span className="text-sm text-slate-500 mb-1">{order.unitOfMeasure}</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CogIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">İlerleme</p>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-slate-900">{progressPercent}%</span>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor="#1e293b"
                trailColor="#e2e8f0"
              />
            </div>
          </div>

          {/* Order Details */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Emir Bilgileri</p>
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                size="small"
                className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
              >
                <Descriptions.Item label="Emir No">{order.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="Ürün">{order.productName}</Descriptions.Item>
                <Descriptions.Item label="Ürün Kodu">{order.productCode}</Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                  >
                    {sConfig.icon}
                    {sConfig.label}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Öncelik">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: pConfig.bgColor, color: pConfig.color }}
                  >
                    {pConfig.label}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Planlanan Başlangıç">
                  {dayjs(order.plannedStartDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Planlanan Bitiş">
                  {dayjs(order.plannedEndDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Gerçek Başlangıç">
                  {order.actualStartDate ? dayjs(order.actualStartDate).format('DD.MM.YYYY HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Gerçek Bitiş">
                  {order.actualEndDate ? dayjs(order.actualEndDate).format('DD.MM.YYYY HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Oluşturan">{order.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Oluşturulma">
                  {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
                {order.notes && (
                  <Descriptions.Item label="Notlar" span={2}>
                    {order.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>

          {/* Tabs for Operations and Materials */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <Tabs
                items={[
                  {
                    key: 'operations',
                    label: (
                      <span className="flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        Operasyonlar ({order.operations.length})
                      </span>
                    ),
                    children: (
                      <Table
                        columns={operationColumns}
                        dataSource={order.operations}
                        rowKey="id"
                        pagination={false}
                        className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
                      />
                    ),
                  },
                  {
                    key: 'materials',
                    label: (
                      <span className="flex items-center gap-2">
                        <CubeIcon className="w-4 h-4" />
                        Malzeme İhtiyaçları ({order.materialRequirements.length})
                      </span>
                    ),
                    children: (
                      <Table
                        columns={materialColumns}
                        dataSource={order.materialRequirements}
                        rowKey="id"
                        pagination={false}
                        className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
                      />
                    ),
                  },
                ]}
                className="[&_.ant-tabs-nav]:!mb-4"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
