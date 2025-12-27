'use client';

/**
 * Purchase Invoice Detail Page
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
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PencilIcon,
  PrinterIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseInvoice,
  useApprovePurchaseInvoice,
  useRejectPurchaseInvoice,
  useCancelPurchaseInvoice,
  useMarkInvoiceAsPaid,
  useSubmitInvoiceForApproval,
} from '@/lib/api/hooks/usePurchase';
import { PurchaseInvoicePrint } from '@/components/print';
import type { PurchaseInvoiceStatus, PurchaseInvoiceItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusConfig: Record<PurchaseInvoiceStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15', tagColor: 'default' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: '#f59e0b15', tagColor: 'orange' },
  Approved: { color: '#8b5cf6', label: 'Onaylandı', bgColor: '#8b5cf615', tagColor: 'purple' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', bgColor: '#ef444415', tagColor: 'red' },
  PartiallyPaid: { color: '#3b82f6', label: 'Kısmen Ödendi', bgColor: '#3b82f615', tagColor: 'blue' },
  Paid: { color: '#10b981', label: 'Ödendi', bgColor: '#10b98115', tagColor: 'green' },
  Cancelled: { color: '#64748b', label: 'İptal', bgColor: '#64748b15', tagColor: 'default' },
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Credit: 'Alacak Dekontu',
  Proforma: 'Proforma',
  Prepayment: 'Ön Ödeme',
};

const getStatusStep = (status: PurchaseInvoiceStatus): number => {
  const steps: Record<PurchaseInvoiceStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Approved: 2,
    PartiallyPaid: 3,
    Paid: 4,
    Rejected: -1,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [printModalVisible, setPrintModalVisible] = useState(false);

  const { data: invoice, isLoading } = usePurchaseInvoice(invoiceId);
  const approveInvoice = useApprovePurchaseInvoice();
  const rejectInvoice = useRejectPurchaseInvoice();
  const cancelInvoice = useCancelPurchaseInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();
  const submitForApproval = useSubmitInvoiceForApproval();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <DocumentTextIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Fatura bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu fatura silinmiş veya erişim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/invoices')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Faturalara Dön
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    approveInvoice.mutate({ id: invoiceId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Faturayı Reddet',
      content: 'Bu faturayı reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectInvoice.mutate({ id: invoiceId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelInvoice.mutate({ id: invoiceId, reason: 'Manuel iptal' }),
    });
  };

  const handleMarkAsPaid = () => {
    markAsPaid.mutate({ id: invoiceId });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(invoiceId);
  };

  const paymentPercentage = invoice.totalAmount > 0
    ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
    : 0;

  const isOverdue = invoice.dueDate && dayjs(invoice.dueDate).isBefore(dayjs(), 'day')
    && !['Paid', 'Cancelled'].includes(invoice.status);

  const actionMenuItems = [
    invoice.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onaya Gönder',
      onClick: handleSubmitForApproval,
    },
    invoice.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    invoice.status === 'PendingApproval' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    ['Approved', 'PartiallyPaid'].includes(invoice.status) && {
      key: 'pay',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
      label: 'Ödeme Kaydet',
      onClick: handleMarkAsPaid,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
      onClick: () => setPrintModalVisible(true),
    },
    { type: 'divider' },
    !['Cancelled', 'Paid'].includes(invoice.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
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
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseInvoiceItemDto) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number, record: PurchaseInvoiceItemDto) => (
        <span className="text-sm text-slate-900">{qty} {record.unit}</span>
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
      key: 'discount',
      align: 'right' as const,
      render: (_: any, record: PurchaseInvoiceItemDto) => (
        <div>
          <span className="text-sm text-slate-500">{record.discountRate > 0 ? `%${record.discountRate}` : '-'}</span>
          {record.discountAmount > 0 && (
            <div className="text-xs text-red-500">
              -{record.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right' as const,
      render: (_: any, record: PurchaseInvoiceItemDto) => (
        <div>
          <span className="text-sm text-slate-500">%{record.vatRate}</span>
          <div className="text-xs text-slate-400">
            {record.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        </div>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span className="text-sm font-semibold text-slate-900">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
  ];

  // Progress steps
  const progressSteps = [
    { key: 'draft', label: 'Taslak', icon: DocumentTextIcon },
    { key: 'pending', label: 'Onay Bekliyor', icon: null },
    { key: 'approved', label: 'Onaylandı', icon: CheckCircleIcon },
    { key: 'partial', label: 'Kısmen Ödendi', icon: null },
    { key: 'paid', label: 'Ödendi', icon: CurrencyDollarIcon },
  ];

  const currentStep = getStatusStep(invoice.status as PurchaseInvoiceStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/invoices')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: statusConfig[invoice.status as PurchaseInvoiceStatus]?.bgColor }}
                >
                  <DocumentTextIcon
                    className="w-5 h-5"
                    style={{ color: statusConfig[invoice.status as PurchaseInvoiceStatus]?.color }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900">{invoice.invoiceNumber}</h1>
                    <Tag color={statusConfig[invoice.status as PurchaseInvoiceStatus]?.tagColor}>
                      {statusConfig[invoice.status as PurchaseInvoiceStatus]?.label}
                    </Tag>
                    {isOverdue && (
                      <Tag color="red" icon={<ExclamationCircleIcon className="w-3 h-3" />}>
                        Vadesi Geçmiş
                      </Tag>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {invoice.supplierName} • {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
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
              {invoice.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/invoices/${invoiceId}/edit`)}
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
              const isError = ['Rejected', 'Cancelled'].includes(invoice.status) && index === 1;

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
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Toplam Tutar</div>
            <div className="text-2xl font-semibold text-slate-900">
              {invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency || '₺'}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ödenen</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {invoice.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Kalan</div>
            <div className={`text-2xl font-semibold ${invoice.remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {invoice.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ödeme Durumu</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    paymentPercentage === 100 ? 'bg-emerald-500' : 'bg-slate-900'
                  }`}
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-900">%{paymentPercentage}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Fatura Kalemleri</h2>
              </div>
              <Table
                dataSource={invoice.items || []}
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
                          {invoice.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {invoice.discountAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <span className="text-sm text-slate-500">
                            İskonto {invoice.discountRate > 0 && `(%${invoice.discountRate})`}:
                          </span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span className="text-sm text-red-600">
                            -{invoice.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <span className="text-sm text-slate-500">KDV Toplam:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-sm text-slate-900">
                          {invoice.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {invoice.withholdingTaxAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <span className="text-sm text-slate-500">Stopaj:</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span className="text-sm text-red-600">
                            -{invoice.withholdingTaxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row className="bg-slate-900">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <span className="text-sm font-medium text-white">Genel Toplam:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-base font-semibold text-white">
                          {invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency || '₺'}
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            {/* Notes */}
            {(invoice.notes || invoice.internalNotes) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Notlar</h2>
                {invoice.notes && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Genel Not</span>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.internalNotes && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dahili Not</span>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{invoice.internalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Tedarikçi Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tedarikçi</span>
                  <button
                    onClick={() => router.push(`/purchase/suppliers/${invoice.supplierId}`)}
                    className="text-sm font-medium text-slate-900 hover:text-slate-700"
                  >
                    {invoice.supplierName}
                  </button>
                </div>
                {invoice.supplierTaxNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Vergi No</span>
                    <span className="text-sm text-slate-900">{invoice.supplierTaxNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Fatura Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Fatura No</span>
                  <span className="text-sm font-medium text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                {invoice.supplierInvoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tedarikçi Fatura No</span>
                    <span className="text-sm text-slate-900">{invoice.supplierInvoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Fatura Tarihi</span>
                  <span className="text-sm text-slate-900">{dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Vade Tarihi</span>
                  <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
                    {invoice.dueDate ? dayjs(invoice.dueDate).format('DD.MM.YYYY') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tip</span>
                  <span className="text-sm text-slate-900">{typeLabels[invoice.type] || invoice.type}</span>
                </div>
                {invoice.currency !== 'TRY' && invoice.exchangeRate && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Para Birimi</span>
                      <span className="text-sm text-slate-900">{invoice.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Kur</span>
                      <span className="text-sm text-slate-900">{invoice.exchangeRate}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related Documents */}
            {(invoice.purchaseOrderNumber || invoice.goodsReceiptNumber) && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">İlişkili Belgeler</h3>
                <div className="space-y-3">
                  {invoice.purchaseOrderNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Sipariş No</span>
                      <button
                        onClick={() => router.push(`/purchase/orders/${invoice.purchaseOrderId}`)}
                        className="text-sm font-medium text-slate-900 hover:text-slate-700"
                      >
                        {invoice.purchaseOrderNumber}
                      </button>
                    </div>
                  )}
                  {invoice.goodsReceiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Mal Alım No</span>
                      <button
                        onClick={() => router.push(`/purchase/goods-receipts/${invoice.goodsReceiptId}`)}
                        className="text-sm font-medium text-slate-900 hover:text-slate-700"
                      >
                        {invoice.goodsReceiptNumber}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* E-Invoice Info */}
            {invoice.eInvoiceId && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">E-Fatura Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">E-Fatura ID</span>
                    <span className="text-sm text-slate-900">{invoice.eInvoiceId}</span>
                  </div>
                  {invoice.eInvoiceUUID && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">E-Fatura UUID</span>
                      <span className="text-sm text-slate-900 truncate max-w-[150px]">{invoice.eInvoiceUUID}</span>
                    </div>
                  )}
                  {invoice.eInvoiceStatus && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Durum</span>
                      <Tag>{invoice.eInvoiceStatus}</Tag>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Info */}
            {invoice.approvalDate && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Onay Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Onay Tarihi</span>
                    <span className="text-sm text-slate-900">{dayjs(invoice.approvalDate).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                  {invoice.approvedByName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Onaylayan</span>
                      <span className="text-sm text-slate-900">{invoice.approvedByName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {invoice && (
        <PurchaseInvoicePrint
          visible={printModalVisible}
          onClose={() => setPrintModalVisible(false)}
          invoice={{
            invoiceNumber: invoice.invoiceNumber,
            supplierInvoiceNumber: invoice.supplierInvoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            supplierName: invoice.supplierName,
            supplierTaxNumber: invoice.supplierTaxNumber,
            status: invoice.status,
            type: invoice.type,
            items: (invoice.items || []).map((item) => ({
              productCode: item.productCode,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
              totalAmount: item.totalAmount,
            })),
            subTotal: invoice.subTotal,
            discountAmount: invoice.discountAmount,
            vatAmount: invoice.vatAmount,
            withholdingTaxAmount: invoice.withholdingTaxAmount,
            totalAmount: invoice.totalAmount,
            paidAmount: invoice.paidAmount,
            remainingAmount: invoice.remainingAmount,
            currency: invoice.currency || 'TRY',
            notes: invoice.notes,
            purchaseOrderNumber: invoice.purchaseOrderNumber,
          }}
        />
      )}
    </div>
  );
}
