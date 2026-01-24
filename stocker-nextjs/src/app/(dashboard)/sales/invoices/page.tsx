'use client';

/**
 * Invoices List Page
 * Türkiye mevzuatına uygun fatura yönetimi
 * Monochrome Design System - DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
  useCancelInvoice,
} from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus, GetInvoicesParams } from '@/lib/api/services/invoice.service';
import { InvoiceService } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';
import { generateInvoicePDF } from '@/lib/utils/pdf-export';
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';

const statusConfig: Record<InvoiceStatus, { bgColor: string; textColor: string; label: string }> = {
  Draft: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Taslak' },
  Issued: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Kesildi' },
  Sent: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Gönderildi' },
  PartiallyPaid: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Kısmi Ödendi' },
  Paid: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Ödendi' },
  Overdue: { bgColor: 'bg-slate-800', textColor: 'text-white', label: 'Vadesi Geçmiş' },
  Cancelled: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'İptal Edildi' },
  Voided: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Geçersiz' },
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  ...Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

const typeOptions = [
  { value: '', label: 'Tüm Tipler' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Return', label: 'İade' },
  { value: 'Credit', label: 'Alacak' },
  { value: 'Debit', label: 'Borç' },
];

// Sort options for invoices
const sortOptions = [
  { value: 'InvoiceDate-desc', label: 'Tarih (Yeniden Eskiye)' },
  { value: 'InvoiceDate-asc', label: 'Tarih (Eskiden Yeniye)' },
  { value: 'grandTotal-desc', label: 'Tutar (Yüksekten Düşüğe)' },
  { value: 'grandTotal-asc', label: 'Tutar (Düşükten Yükseğe)' },
  { value: 'dueDate-asc', label: 'Vade (Yakından Uzağa)' },
  { value: 'dueDate-desc', label: 'Vade (Uzaktan Yakına)' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GetInvoicesParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    sortBy: 'InvoiceDate',
    sortDescending: true,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const { data, isLoading, refetch } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();

  const invoices = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize || 20));

  // Calculate stats
  const stats = useMemo(() => {
    const draft = invoices.filter(i => i.status === 'Draft').length;
    const overdue = invoices.filter(i => i.status === 'Overdue').length;
    const totalValue = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const totalDue = invoices.reduce((sum, i) => sum + (i.remainingAmount || 0), 0);
    return { draft, overdue, totalValue, totalDue };
  }, [invoices]);

  const handleIssue = async (id: string) => {
    try {
      await issueInvoice.mutateAsync(id);
      showSuccess('Başarılı', 'Fatura kesildi');
      setOpenDropdownId(null);
    } catch {
      showError('Fatura kesme başarısız');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice.mutateAsync(id);
      showSuccess('Başarılı', 'Fatura gönderildi');
      setOpenDropdownId(null);
    } catch {
      showError('Gönderim başarısız');
    }
  };

  const handleCancel = async (invoice: InvoiceListItem) => {
    const confirmed = await confirmAction(
      'Faturayı İptal Et',
      'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      'İptal Et'
    );
    if (confirmed) {
      try {
        await cancelInvoice.mutateAsync(invoice.id);
        showSuccess('Başarılı', 'Fatura iptal edildi');
        setOpenDropdownId(null);
      } catch {
        showError('İptal işlemi başarısız');
      }
    }
  };

  const handleDelete = async (invoice: InvoiceListItem) => {
    const confirmed = await confirmDelete('Fatura', invoice.invoiceNumber);
    if (confirmed) {
      try {
        await deleteInvoice.mutateAsync(invoice.id);
        showSuccess('Başarılı', 'Fatura silindi');
        setOpenDropdownId(null);
      } catch {
        showError('Silme işlemi başarısız');
      }
    }
  };

  // Bulk operations
  const handleBulkPdfExport = async () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen PDF oluşturmak için fatura seçiniz');
      return;
    }
    setBulkLoading(true);
    try {
      for (const id of selectedRowKeys) {
        const invoice = await InvoiceService.getInvoiceById(id);
        await generateInvoicePDF(invoice);
      }
      showSuccess('Başarılı', `${selectedRowKeys.length} fatura PDF olarak indirildi`);
    } catch {
      showError('PDF oluşturulurken hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkIssue = async () => {
    const draftInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Draft';
    });

    if (draftInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında kesilebilecek taslak fatura bulunamadı');
      return;
    }

    const confirmed = await confirmAction(
      'Toplu Fatura Kesme',
      `${draftInvoices.length} adet taslak fatura kesilecek. Devam etmek istiyor musunuz?`,
      'Kes'
    );

    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of draftInvoices) {
          try {
            await issueInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla kesildi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkSend = async () => {
    const issuedInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Issued';
    });

    if (issuedInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında gönderilebilecek fatura bulunamadı');
      return;
    }

    const confirmed = await confirmAction(
      'Toplu Fatura Gönderimi',
      `${issuedInvoices.length} adet fatura gönderilecek. Devam etmek istiyor musunuz?`,
      'Gönder'
    );

    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of issuedInvoices) {
          try {
            await sendInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla gönderildi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    const deletableInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Draft' || inv?.status === 'Cancelled';
    });

    if (deletableInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında silinebilecek fatura bulunamadı (sadece taslak veya iptal edilmiş faturalar silinebilir)');
      return;
    }

    const confirmed = await confirmDelete('Fatura', `${deletableInvoices.length} fatura`);
    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of deletableInvoices) {
          try {
            await deleteInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla silindi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedRowKeys.length === invoices.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(invoices.map(i => i.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRowKeys.includes(id)) {
      setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
    } else {
      setSelectedRowKeys([...selectedRowKeys, id]);
    }
  };

  const handleSort = (value: string) => {
    const [sortBy, order] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortDescending: order === 'desc',
      page: 1,
    }));
  };

  const handleDateFilter = () => {
    setFilters(prev => ({
      ...prev,
      fromDate: fromDate ? dayjs(fromDate).toISOString() : undefined,
      toDate: toDate ? dayjs(toDate).toISOString() : undefined,
      page: 1,
    }));
  };

  const clearDateFilter = () => {
    setFromDate('');
    setToDate('');
    setFilters(prev => ({
      ...prev,
      fromDate: undefined,
      toDate: undefined,
      page: 1,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Faturalar</h1>
            <p className="text-sm text-slate-500">
              Satış faturalarını yönetin
              {totalCount > 0 && <span className="ml-2 text-slate-400">({totalCount} fatura)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm text-slate-700">Yenile</span>
          </button>
          <button
            onClick={() => router.push('/sales/invoices/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Yeni Fatura</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Fatura</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Taslak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.draft}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Vadesi Geçmiş</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.overdue}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Bakiye</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalDue)}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700 font-medium">
              {selectedRowKeys.length} fatura seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPdfExport}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <DocumentIcon className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleBulkIssue}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Kes
              </button>
              <button
                onClick={handleBulkSend}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Gönder
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                Sil
              </button>
              <button
                onClick={() => setSelectedRowKeys([])}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Fatura ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Başlangıç"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Bitiş"
            />
            <button
              onClick={handleDateFilter}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
            >
              Uygula
            </button>
            {(fromDate || toDate) && (
              <button
                onClick={clearDateFilter}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={`${filters.sortBy}-${filters.sortDescending ? 'desc' : 'asc'}`}
            onChange={(e) => handleSort(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Fatura bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.length === invoices.length && invoices.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fatura</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ödenen</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Kalan</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">E-Fatura</th>
                    <th className="w-16 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRowKeys.includes(invoice.id)}
                          onChange={() => handleSelectRow(invoice.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <Link
                              href={`/sales/invoices/${invoice.id}`}
                              className="text-sm font-medium text-slate-900 hover:text-slate-600"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {invoice.customerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-600">
                          {dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${invoice.status === 'Overdue' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                          {invoice.dueDate ? dayjs(invoice.dueDate).format('DD.MM.YYYY') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[invoice.status as InvoiceStatus]?.bgColor || 'bg-slate-100'} ${statusConfig[invoice.status as InvoiceStatus]?.textColor || 'text-slate-600'}`}>
                          {statusConfig[invoice.status as InvoiceStatus]?.label || invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {(invoice.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm text-slate-600">
                          {(invoice.paidAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`text-sm font-medium ${(invoice.remainingAmount || 0) > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                          {(invoice.remainingAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${invoice.isEInvoice ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
                          {invoice.isEInvoice ? 'E-Fatura' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-4 relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === invoice.id ? null : invoice.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>
                        {openDropdownId === invoice.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    router.push(`/sales/invoices/${invoice.id}`);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  Görüntüle
                                </button>
                                {invoice.status === 'Draft' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        router.push(`/sales/invoices/${invoice.id}/edit`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() => handleIssue(invoice.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <CheckCircleIcon className="w-4 h-4" />
                                      Kes
                                    </button>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                      onClick={() => handleDelete(invoice)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      Sil
                                    </button>
                                  </>
                                )}
                                {invoice.status === 'Issued' && (
                                  <button
                                    onClick={() => handleSend(invoice.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <EnvelopeIcon className="w-4 h-4" />
                                    Gönder
                                  </button>
                                )}
                                {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && invoice.status !== 'Draft' && (
                                  <button
                                    onClick={() => handleCancel(invoice)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <XCircleIcon className="w-4 h-4" />
                                    İptal Et
                                  </button>
                                )}
                                {invoice.status === 'Cancelled' && (
                                  <button
                                    onClick={() => handleDelete(invoice)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    Sil
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1}-{Math.min((filters.page || 1) * (filters.pageSize || 20), totalCount)} / {totalCount} fatura
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={filters.pageSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
                >
                  <option value={10}>10 / sayfa</option>
                  <option value={20}>20 / sayfa</option>
                  <option value={50}>50 / sayfa</option>
                  <option value={100}>100 / sayfa</option>
                </select>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={(filters.page || 1) <= 1}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-600">
                  {filters.page || 1} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={(filters.page || 1) >= totalPages}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
