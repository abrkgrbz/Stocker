'use client';

/**
 * Purchase Order Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Spin,
  Dropdown,
  Modal,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  ShoppingCartIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
  useCompletePurchaseOrder,
} from '@/lib/api/hooks/usePurchase';
import { PurchaseOrderPrint } from '@/components/print';
import { ApprovalWorkflow } from '@/components/purchase/workflow';
import type { ApprovalStep, ApprovalHistory } from '@/components/purchase/workflow';
import type { PurchaseOrderStatus, PurchaseOrderItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusConfig: Record<PurchaseOrderStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15', tagColor: 'default' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: '#f59e0b15', tagColor: 'orange' },
  Confirmed: { color: '#3b82f6', label: 'Onaylandı', bgColor: '#3b82f615', tagColor: 'blue' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', bgColor: '#ef444415', tagColor: 'red' },
  Sent: { color: '#06b6d4', label: 'Gönderildi', bgColor: '#06b6d415', tagColor: 'cyan' },
  PartiallyReceived: { color: '#8b5cf6', label: 'Kısmen Alındı', bgColor: '#8b5cf615', tagColor: 'purple' },
  Received: { color: '#6366f1', label: 'Teslim Alındı', bgColor: '#6366f115', tagColor: 'geekblue' },
  Completed: { color: '#10b981', label: 'Tamamlandı', bgColor: '#10b98115', tagColor: 'green' },
  Cancelled: { color: '#64748b', label: 'İptal', bgColor: '#64748b15', tagColor: 'default' },
  Closed: { color: '#64748b', label: 'Kapatıldı', bgColor: '#64748b15', tagColor: 'default' },
};

const getStatusStep = (status: PurchaseOrderStatus): number => {
  const steps: Record<PurchaseOrderStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Confirmed: 2,
    Rejected: -1,
    Sent: 3,
    PartiallyReceived: 4,
    Received: 5,
    Completed: 6,
    Cancelled: -1,
    Closed: 6,
  };
  return steps[status] ?? 0;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [printModalVisible, setPrintModalVisible] = useState(false);

  const { data: order, isLoading } = usePurchaseOrder(orderId);
  const approveOrder = useApprovePurchaseOrder();
  const rejectOrder = useRejectPurchaseOrder();
  const sendOrder = useSendPurchaseOrder();
  const confirmOrder = useConfirmPurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();
  const completeOrder = useCompletePurchaseOrder();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Sipariş bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu sipariş silinmiş veya erişim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/orders')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Siparişlere Dön
        </button>
      </div>
    );
  }

  const handleApprove = (notes?: string) => {
    approveOrder.mutate({ id: orderId, notes });
  };

  const handleReject = (reason: string) => {
    rejectOrder.mutate({ id: orderId, reason });
  };

  const handleSend = () => {
    sendOrder.mutate(orderId);
  };

  const handleConfirm = () => {
    confirmOrder.mutate(orderId);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Siparişi İptal Et',
      content: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelOrder.mutate({ id: orderId, reason: 'Manual cancellation' }),
    });
  };

  const handleComplete = () => {
    completeOrder.mutate(orderId);
  };

  // Build approval workflow steps
  const approvalSteps: ApprovalStep[] = [
    {
      id: '1',
      order: 1,
      name: 'Onay Talebi',
      status: order.status === 'Draft' ? 'waiting' : 'approved',
      approverRole: 'Talep Eden',
    },
    {
      id: '2',
      order: 2,
      name: 'Yönetici Onayı',
      status: order.status === 'PendingApproval' ? 'pending' :
              order.status === 'Rejected' ? 'rejected' :
              ['Confirmed', 'Sent', 'PartiallyReceived', 'Received', 'Completed', 'Closed'].includes(order.status) ? 'approved' : 'waiting',
      approverName: order.approvedByName,
      approverId: order.approvedById,
      approvalDate: order.approvalDate,
      approverRole: 'Satın Alma Yöneticisi',
    },
    {
      id: '3',
      order: 3,
      name: 'Tedarikçi Onayı',
      status: ['Sent', 'PartiallyReceived', 'Received', 'Completed', 'Closed'].includes(order.status) ? 'approved' :
              order.status === 'Confirmed' ? 'pending' : 'waiting',
      approverRole: 'Tedarikçi',
    },
  ];

  // Build approval history
  const approvalHistory: ApprovalHistory[] = [
    ...(order.createdAt ? [{
      id: 'h1',
      action: 'submitted' as const,
      actorName: 'Sistem',
      actorId: 'system',
      timestamp: order.createdAt,
      stepName: 'Sipariş Oluşturuldu',
    }] : []),
    ...(order.approvalDate && order.approvedByName ? [{
      id: 'h2',
      action: 'approved' as const,
      actorName: order.approvedByName,
      actorId: order.approvedById || '',
      timestamp: order.approvalDate,
      stepName: 'Yönetici Onayı',
    }] : []),
    ...(order.sentDate ? [{
      id: 'h3',
      action: 'submitted' as const,
      actorName: 'Sistem',
      actorId: 'system',
      timestamp: order.sentDate,
      stepName: 'Tedarikçiye Gönderildi',
    }] : []),
  ];

  const getCurrentStep = (): number => {
    if (order.status === 'Draft') return 0;
    if (order.status === 'PendingApproval') return 1;
    if (order.status === 'Confirmed') return 2;
    return 2;
  };

  const actionMenuItems = [
    order.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    order.status === 'PendingApproval' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    order.status === 'Confirmed' && {
      key: 'send',
      icon: <PaperAirplaneIcon className="w-4 h-4" />,
      label: 'Tedarikçiye Gönder',
      onClick: handleSend,
    },
    order.status === 'Sent' && {
      key: 'confirm',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Tedarikçi Onayı',
      onClick: handleConfirm,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
      onClick: () => setPrintModalVisible(true),
    },
    { type: 'divider' },
    !['Cancelled', 'Completed', 'Closed'].includes(order.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
    order.status === 'Received' && {
      key: 'complete',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Tamamla',
      onClick: handleComplete,
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
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseOrderItemDto) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      align: 'center' as const,
      render: (record: PurchaseOrderItemDto) => (
        <div>
          <div className="text-sm text-slate-900">{record.quantity} {record.unit}</div>
          {record.receivedQuantity !== undefined && record.receivedQuantity > 0 && (
            <div className="text-xs text-emerald-600">
              Alınan: {record.receivedQuantity}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'İskonto',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      align: 'center' as const,
      render: (discount: number) => (
        <span className="text-sm text-slate-500">{discount ? `%${discount}` : '-'}</span>
      ),
    },
    {
      title: 'KDV',
      dataIndex: 'taxRate',
      key: 'taxRate',
      align: 'center' as const,
      render: (rate: number) => (
        <span className="text-sm text-slate-500">%{rate || 18}</span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) => (
        <span className="text-sm font-semibold text-slate-900">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
  ];

  // Progress steps data
  const progressSteps = [
    { key: 'draft', label: 'Taslak', icon: DocumentTextIcon },
    { key: 'pending', label: 'Onay Bekliyor', icon: null },
    { key: 'confirmed', label: 'Onaylandı', icon: CheckCircleIcon },
    { key: 'sent', label: 'Gönderildi', icon: PaperAirplaneIcon },
    { key: 'received', label: 'Teslim Alındı', icon: TruckIcon },
    { key: 'completed', label: 'Tamamlandı', icon: CheckCircleIcon },
  ];

  const currentStep = getStatusStep(order.status as PurchaseOrderStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/orders')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: statusConfig[order.status as PurchaseOrderStatus]?.bgColor }}
                >
                  <ShoppingCartIcon
                    className="w-5 h-5"
                    style={{ color: statusConfig[order.status as PurchaseOrderStatus]?.color }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h1>
                    <Tag color={statusConfig[order.status as PurchaseOrderStatus]?.tagColor}>
                      {statusConfig[order.status as PurchaseOrderStatus]?.label}
                    </Tag>
                  </div>
                  <p className="text-sm text-slate-500">
                    {order.supplierName} • {dayjs(order.orderDate).format('DD.MM.YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                  İşlemler
                </button>
              </Dropdown>
              {order.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/orders/${orderId}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {progressSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep && currentStep >= 0;
              const isError = ['Rejected', 'Cancelled'].includes(order.status) && index === 1;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isError ? 'bg-red-100 text-red-600' :
                        isCompleted ? 'bg-slate-900 text-white' :
                        isActive ? 'bg-slate-100 text-slate-900 ring-2 ring-slate-900' :
                        'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.icon ? (
                        <step.icon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isError ? 'text-red-600' :
                      isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-slate-900' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ara Toplam</div>
            <div className="text-2xl font-semibold text-slate-900">
              {(order.subTotal || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">İskonto</div>
            <div className="text-2xl font-semibold text-red-600">
              -{(order.discountAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">KDV</div>
            <div className="text-2xl font-semibold text-slate-900">
              {(order.vatAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Genel Toplam</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {(order.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency || '₺'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Sipariş Kalemleri</h2>
              </div>
              <Table
                dataSource={order.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row className="bg-slate-50">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <span className="text-sm font-medium text-slate-700">Ara Toplam:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-sm text-slate-900">
                          {(order.subTotal || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {order.discountAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <span className="text-sm text-slate-500">İskonto:</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span className="text-sm text-red-600">
                            -{(order.discountAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <span className="text-sm text-slate-500">KDV:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-sm text-slate-900">
                          {(order.vatAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row className="bg-slate-900">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <span className="text-sm font-medium text-white">Genel Toplam:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-base font-semibold text-white">
                          {(order.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency || '₺'}
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-3">Notlar</h2>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Approval Workflow */}
            {order.status !== 'Draft' && (
              <ApprovalWorkflow
                documentType="order"
                documentNumber={order.orderNumber}
                documentStatus={order.status}
                totalAmount={order.totalAmount}
                currency={order.currency || 'TRY'}
                steps={approvalSteps}
                currentStep={getCurrentStep()}
                history={approvalHistory}
                canApprove={order.status === 'PendingApproval'}
                canReject={order.status === 'PendingApproval'}
                canCancel={!['Cancelled', 'Completed', 'Closed'].includes(order.status)}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={(reason) => cancelOrder.mutate({ id: orderId, reason })}
                showHistory={true}
              />
            )}

            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Tedarikçi Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tedarikçi</span>
                  <button
                    onClick={() => router.push(`/purchase/suppliers/${order.supplierId}`)}
                    className="text-sm font-medium text-slate-900 hover:text-slate-700"
                  >
                    {order.supplierName}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Kod</span>
                  <span className="text-sm text-slate-900">{order.supplierCode}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Sipariş Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Sipariş No</span>
                  <span className="text-sm font-medium text-slate-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Sipariş Tarihi</span>
                  <span className="text-sm text-slate-900">{dayjs(order.orderDate).format('DD.MM.YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Beklenen Teslim</span>
                  <span className="text-sm text-slate-900">
                    {order.expectedDeliveryDate ? dayjs(order.expectedDeliveryDate).format('DD.MM.YYYY') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Sipariş Tipi</span>
                  <span className="text-sm text-slate-900">{order.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Para Birimi</span>
                  <span className="text-sm text-slate-900">{order.currency || 'TRY'}</span>
                </div>
                {order.supplierOrderNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tedarikçi Ref.</span>
                    <span className="text-sm text-slate-900">{order.supplierOrderNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Kargo Bilgileri</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Kargo Adresi</span>
                    <span className="text-sm text-slate-900">{order.shippingAddress}</span>
                  </div>
                  {order.shippingMethod && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Kargo Yöntemi</span>
                      <span className="text-sm text-slate-900">{order.shippingMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {order && (
        <PurchaseOrderPrint
          visible={printModalVisible}
          onClose={() => setPrintModalVisible(false)}
          order={{
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            expectedDeliveryDate: order.expectedDeliveryDate,
            supplierName: order.supplierName,
            supplierCode: order.supplierCode,
            status: order.status,
            items: (order.items || []).map((item) => ({
              productCode: item.productCode,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              taxRate: item.vatRate,
              lineTotal: item.totalAmount,
            })),
            subTotal: order.subTotal || 0,
            discountAmount: order.discountAmount || 0,
            vatAmount: order.vatAmount || 0,
            totalAmount: order.totalAmount || 0,
            currency: order.currency || 'TRY',
            notes: order.notes,
            shippingAddress: order.shippingAddress,
          }}
        />
      )}
    </div>
  );
}
