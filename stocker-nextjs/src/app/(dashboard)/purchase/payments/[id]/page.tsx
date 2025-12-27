'use client';

/**
 * Supplier Payment Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Tag,
  Spin,
  Dropdown,
  Modal,
  Descriptions,
  Timeline,
} from 'antd';
import type { TimelineItemProps } from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  PlayCircleIcon,
  PrinterIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useSupplierPayment,
  useApproveSupplierPayment,
  useRejectSupplierPayment,
  useCancelSupplierPayment,
  useProcessSupplierPayment,
  useReconcileSupplierPayment,
  useSubmitPaymentForApproval,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierPaymentStatus, PaymentMethod } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

type StatusConfig = {
  color: string;
  label: string;
  bgColor: string;
};

const statusConfig: Record<SupplierPaymentStatus, StatusConfig> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: 'bg-slate-100' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: 'bg-amber-100' },
  Approved: { color: '#06b6d4', label: 'Onaylandı', bgColor: 'bg-cyan-100' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', bgColor: 'bg-red-100' },
  Processed: { color: '#6366f1', label: 'İşlendi', bgColor: 'bg-indigo-100' },
  Completed: { color: '#22c55e', label: 'Tamamlandı', bgColor: 'bg-emerald-100' },
  Cancelled: { color: '#94a3b8', label: 'İptal', bgColor: 'bg-slate-100' },
  Failed: { color: '#dc2626', label: 'Başarısız', bgColor: 'bg-red-100' },
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  Cash: <CurrencyDollarIcon className="w-4 h-4" />,
  BankTransfer: <BuildingLibraryIcon className="w-4 h-4" />,
  CreditCard: <CreditCardIcon className="w-4 h-4" />,
  Check: <WalletIcon className="w-4 h-4" />,
  DirectDebit: <ArrowPathIcon className="w-4 h-4" />,
  Other: <WalletIcon className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Advance: 'Avans',
  Partial: 'Kısmi',
  Final: 'Son',
  Refund: 'İade',
};

const getStatusStep = (status: SupplierPaymentStatus): number => {
  const steps: Record<SupplierPaymentStatus, number> = {
    Draft: 0,
    PendingApproval: 1,
    Approved: 2,
    Processed: 3,
    Completed: 4,
    Rejected: -1,
    Cancelled: -1,
    Failed: -1,
  };
  return steps[status] ?? 0;
};

export default function SupplierPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const { data: payment, isLoading } = useSupplierPayment(paymentId);
  const approvePayment = useApproveSupplierPayment();
  const rejectPayment = useRejectSupplierPayment();
  const cancelPayment = useCancelSupplierPayment();
  const processPayment = useProcessSupplierPayment();
  const reconcilePayment = useReconcileSupplierPayment();
  const submitForApproval = useSubmitPaymentForApproval();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <WalletIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Ödeme belgesi bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu ödeme silinmiş veya erişim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/payments')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Ödemelere Dön
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    approvePayment.mutate({ id: paymentId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Ödemeyi Reddet',
      content: 'Bu ödemeyi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectPayment.mutate({ id: paymentId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Ödemeyi İptal Et',
      content: 'Bu ödemeyi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelPayment.mutate({ id: paymentId, reason: 'Manuel iptal' }),
    });
  };

  const handleProcess = () => {
    processPayment.mutate(paymentId);
  };

  const handleReconcile = () => {
    reconcilePayment.mutate({ id: paymentId, bankTransactionId: `BANK-${payment.paymentNumber}` });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(paymentId);
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const currentStatus = statusConfig[payment.status as SupplierPaymentStatus] || statusConfig.Draft;
  const currentStep = getStatusStep(payment.status as SupplierPaymentStatus);
  const isRejectedOrCancelled = ['Rejected', 'Cancelled', 'Failed'].includes(payment.status);

  const actionMenuItems = [
    payment.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onaya Gönder',
      onClick: handleSubmitForApproval,
    },
    payment.status === 'PendingApproval' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    payment.status === 'PendingApproval' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    payment.status === 'Approved' && {
      key: 'process',
      icon: <PlayCircleIcon className="w-4 h-4" />,
      label: 'İşle',
      onClick: handleProcess,
    },
    payment.status === 'Completed' && !payment.isReconciled && {
      key: 'reconcile',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      label: 'Mutabakat Yap',
      onClick: handleReconcile,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed', 'Failed'].includes(payment.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
  ].filter(Boolean) as MenuProps['items'];

  // Custom progress steps
  const progressSteps = [
    { key: 'draft', label: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { key: 'pending', label: 'Onay Bekliyor', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { key: 'approved', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
    { key: 'processed', label: 'İşlendi', icon: <PlayCircleIcon className="w-4 h-4" /> },
    { key: 'completed', label: 'Tamamlandı', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/payments')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900">{payment.paymentNumber}</h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.bgColor}`}
                      style={{ color: currentStatus.color }}
                    >
                      {currentStatus.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {payment.supplierName} • {dayjs(payment.paymentDate).format('DD.MM.YYYY')}
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
              {payment.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/payments/${paymentId}/edit`)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {progressSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isError = isRejectedOrCancelled && index === 0;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isError
                          ? 'bg-red-100 text-red-600'
                          : isCompleted
                          ? 'bg-slate-900 text-white'
                          : isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              {methodIcons[payment.method as PaymentMethod]}
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ödeme Tutarı</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(payment.amount, payment.currency)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Ödeme Yöntemi</div>
            <p className="text-lg font-semibold text-slate-900">
              {methodLabels[payment.method as PaymentMethod] || payment.method}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Ödeme Tipi</div>
            <p className="text-lg font-semibold text-slate-900">
              {typeLabels[payment.type] || payment.type}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Mutabakat</div>
            <p className={`text-lg font-semibold ${payment.isReconciled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {payment.isReconciled ? 'Yapıldı' : 'Bekliyor'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-6">
            {/* Payment Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Ödeme Detayları</h3>
              <Descriptions column={2} size="small" className="[&_.ant-descriptions-item-label]:!text-slate-500">
                <Descriptions.Item label="Ödeme No">{payment.paymentNumber}</Descriptions.Item>
                <Descriptions.Item label="Ödeme Tarihi">
                  {dayjs(payment.paymentDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tutar">
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </Descriptions.Item>
                {payment.currency !== 'TRY' && payment.exchangeRate && (
                  <>
                    <Descriptions.Item label="Döviz Kuru">{payment.exchangeRate}</Descriptions.Item>
                    <Descriptions.Item label="TL Karşılığı">
                      {formatCurrency(payment.amountInBaseCurrency, 'TRY')}
                    </Descriptions.Item>
                  </>
                )}
                <Descriptions.Item label="Ödeme Yöntemi">
                  <span className="flex items-center gap-2">
                    {methodIcons[payment.method as PaymentMethod]}
                    {methodLabels[payment.method as PaymentMethod] || payment.method}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Tipi">
                  {typeLabels[payment.type] || payment.type}
                </Descriptions.Item>
                {payment.transactionReference && (
                  <Descriptions.Item label="İşlem Referansı" span={2}>
                    {payment.transactionReference}
                  </Descriptions.Item>
                )}
                {payment.description && (
                  <Descriptions.Item label="Açıklama" span={2}>
                    {payment.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {/* Bank Details */}
            {(payment.bankName || payment.iban || payment.checkNumber) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Banka / Ödeme Bilgileri</h3>
                <Descriptions column={2} size="small" className="[&_.ant-descriptions-item-label]:!text-slate-500">
                  {payment.bankName && (
                    <Descriptions.Item label="Banka">{payment.bankName}</Descriptions.Item>
                  )}
                  {payment.bankAccountNumber && (
                    <Descriptions.Item label="Hesap No">{payment.bankAccountNumber}</Descriptions.Item>
                  )}
                  {payment.iban && (
                    <Descriptions.Item label="IBAN" span={2}>{payment.iban}</Descriptions.Item>
                  )}
                  {payment.swiftCode && (
                    <Descriptions.Item label="SWIFT">{payment.swiftCode}</Descriptions.Item>
                  )}
                  {payment.checkNumber && (
                    <Descriptions.Item label="Çek No">{payment.checkNumber}</Descriptions.Item>
                  )}
                  {payment.checkDate && (
                    <Descriptions.Item label="Çek Tarihi">
                      {dayjs(payment.checkDate).format('DD.MM.YYYY')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}

            {/* Notes */}
            {(payment.notes || payment.internalNotes) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Notlar</h3>
                {payment.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 mb-1">Genel Not</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{payment.notes}</p>
                  </div>
                )}
                {payment.internalNotes && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Dahili Not</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{payment.internalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-6">
            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Tedarikçi Bilgileri</h3>
              <button
                onClick={() => router.push(`/purchase/suppliers/${payment.supplierId}`)}
                className="text-sm text-slate-900 hover:text-slate-600 transition-colors"
              >
                {payment.supplierName}
              </button>
            </div>

            {/* Related Invoice */}
            {payment.purchaseInvoiceNumber && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">İlişkili Fatura</h3>
                <button
                  onClick={() => router.push(`/purchase/invoices/${payment.purchaseInvoiceId}`)}
                  className="text-sm text-slate-900 hover:text-slate-600 transition-colors"
                >
                  {payment.purchaseInvoiceNumber}
                </button>
              </div>
            )}

            {/* Process History */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">İşlem Geçmişi</h3>
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Oluşturuldu</p>
                        <p className="text-xs text-slate-500">
                          {dayjs(payment.createdAt).format('DD.MM.YYYY HH:mm')}
                        </p>
                      </div>
                    ),
                  },
                  payment.approvalDate && {
                    color: 'blue',
                    children: (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Onaylandı</p>
                        {payment.approvedByName && (
                          <p className="text-xs text-slate-600">{payment.approvedByName}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {dayjs(payment.approvalDate).format('DD.MM.YYYY HH:mm')}
                        </p>
                      </div>
                    ),
                  },
                  payment.processedDate && {
                    color: 'purple',
                    children: (
                      <div>
                        <p className="text-sm font-medium text-slate-900">İşlendi</p>
                        {payment.processedByName && (
                          <p className="text-xs text-slate-600">{payment.processedByName}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {dayjs(payment.processedDate).format('DD.MM.YYYY HH:mm')}
                        </p>
                      </div>
                    ),
                  },
                  payment.reconciliationDate && {
                    color: 'green',
                    children: (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Mutabakat Yapıldı</p>
                        {payment.reconciliationReference && (
                          <p className="text-xs text-slate-600">{payment.reconciliationReference}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {dayjs(payment.reconciliationDate).format('DD.MM.YYYY HH:mm')}
                        </p>
                      </div>
                    ),
                  },
                ].filter(Boolean) as TimelineItemProps[]}
              />
            </div>

            {/* Reconciliation Info */}
            {payment.isReconciled && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Mutabakat Bilgileri</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag color="green">Mutabakat Yapıldı</Tag>
                  </div>
                  {payment.reconciliationDate && (
                    <p className="text-xs text-slate-500">
                      {dayjs(payment.reconciliationDate).format('DD.MM.YYYY HH:mm')}
                    </p>
                  )}
                  {payment.reconciliationReference && (
                    <p className="text-xs text-slate-600">{payment.reconciliationReference}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
