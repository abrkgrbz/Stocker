'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Tag, Spin, Empty, Tabs, Table, Modal } from 'antd';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  PrinterIcon,
  TrashIcon,
  UserIcon,
  XCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useInvoice, useDeleteInvoice, useApproveInvoice, useCancelInvoice, useRecordInvoicePayment } from '@/lib/api/hooks/useFinance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = Number(params.id);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const deleteInvoice = useDeleteInvoice();
  const approveInvoice = useApproveInvoice();
  const cancelInvoice = useCancelInvoice();

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Beklemede', icon: <ClockIcon className="w-4 h-4" /> },
      Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi', icon: <CheckCircleIcon className="w-4 h-4" /> },
      PartiallyPaid: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Kısmi Ödeme', icon: <BanknotesIcon className="w-4 h-4" /> },
      Overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vadesi Geçti', icon: <XCircleIcon className="w-4 h-4" /> },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    return configs[status] || configs.Draft;
  };

  const getInvoiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Sales: 'Satış Faturası',
      Purchase: 'Alış Faturası',
      Return: 'İade Faturası',
      Proforma: 'Proforma Fatura',
    };
    return labels[type] || type;
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: 'Faturayı Onayla',
      content: 'Bu faturayı onaylamak istediğinize emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await approveInvoice.mutateAsync(invoiceId);
          showSuccess('Fatura onaylandı');
        } catch (error) {
          showApiError(error, 'Fatura onaylanamadı');
        }
      },
    });
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      okText: 'İptal Et',
      cancelText: 'Vazgeç',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cancelInvoice.mutateAsync({ id: invoiceId });
          showSuccess('Fatura iptal edildi');
        } catch (error) {
          showApiError(error, 'Fatura iptal edilemedi');
        }
      },
    });
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Faturayı Sil',
      content: 'Bu faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteInvoice.mutateAsync(invoiceId);
          showSuccess('Fatura silindi');
          router.push('/finance/invoices');
        } catch (error) {
          showApiError(error, 'Fatura silinemedi');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Fatura bulunamadı" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(invoice.status);
  const items = invoice.items || [];

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
              onClick={() => router.push('/finance/invoices')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-blue-600`}>
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {invoice.invoiceNumber || 'Taslak Fatura'}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0">{getInvoiceTypeLabel(invoice.invoiceType)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status === 'Draft' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveInvoice.isPending}
                className="border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Onayla
              </Button>
            )}
            {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && (
              <Button
                icon={<XCircleIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelInvoice.isPending}
                className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                İptal Et
              </Button>
            )}
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Yazdır
            </Button>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/finance/invoices/${invoiceId}/edit`)}
            >
              Düzenle
            </Button>
            <Button
              icon={<TrashIcon className="w-4 h-4" />}
              danger
              onClick={handleDelete}
              loading={deleteInvoice.isPending}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Invoice Info */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Fatura Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Fatura No</p>
                  <p className="text-sm font-medium text-slate-900">{invoice.invoiceNumber || 'Taslak'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Fatura Tarihi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {invoice.invoiceDate ? dayjs(invoice.invoiceDate).format('DD MMM YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vade Tarihi</p>
                  <p className={`text-sm font-medium ${
                    invoice.dueDate && dayjs(invoice.dueDate).isBefore(dayjs()) && invoice.status !== 'Paid'
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}>
                    {invoice.dueDate ? dayjs(invoice.dueDate).format('DD MMM YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                  <p className="text-sm font-medium text-slate-900">{invoice.currency || 'TRY'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    {invoice.invoiceType === 'Sales' ? 'Müşteri' : 'Tedarikçi'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ad/Unvan</p>
                    <p className="text-sm font-medium text-slate-900">{invoice.customerName || invoice.vendorName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Vergi No</p>
                    <p className="text-sm font-medium text-slate-900">{invoice.customerTaxNumber || '-'}</p>
                  </div>
                  {invoice.customerAddress && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-1">Adres</p>
                      <p className="text-sm font-medium text-slate-900">{invoice.customerAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white border border-slate-200 rounded-xl mt-6 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Fatura Kalemleri
                </p>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ürün</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Miktar</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Birim Fiyat</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">KDV</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{item.productName || item.description}</div>
                          <div className="text-xs text-slate-500">{item.productCode}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          %{item.kdvRate || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                          {formatCurrency(item.lineTotal || 0, invoice.currency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Fatura kalemi bulunmuyor
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Fatura Özeti
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Ara Toplam</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(invoice.subtotal || 0, invoice.currency)}
                  </span>
                </div>
                {(invoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">İndirim</span>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(invoice.discountAmount || 0, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">KDV</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(invoice.kdvAmount || 0, invoice.currency)}
                  </span>
                </div>
                {(invoice.tevkifatAmount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Tevkifat</span>
                    <span className="text-sm font-medium text-slate-700">
                      -{formatCurrency(invoice.tevkifatAmount || 0, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Genel Toplam</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(invoice.totalAmount || 0, invoice.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Ödeme Durumu
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Ödenen</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {formatCurrency(invoice.paidAmount || 0, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Kalan</span>
                    <span className={`text-sm font-medium ${
                      (invoice.remainingAmount || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(invoice.remainingAmount || (invoice.totalAmount || 0) - (invoice.paidAmount || 0), invoice.currency)}
                    </span>
                  </div>
                </div>

                {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                  <Button
                    type="primary"
                    icon={<BanknotesIcon className="w-4 h-4" />}
                    block
                    className="mt-4"
                    onClick={() => router.push(`/finance/payments/new?invoiceId=${invoiceId}`)}
                  >
                    Ödeme Kaydet
                  </Button>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Oluşturulma: {dayjs(invoice.createdAt).format('DD MMM YYYY HH:mm')}</span>
                  </div>
                  {invoice.updatedAt && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Güncelleme: {dayjs(invoice.updatedAt).format('DD MMM YYYY HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
