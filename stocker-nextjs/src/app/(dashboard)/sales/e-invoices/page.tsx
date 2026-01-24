'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  EyeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInvoices, useSetEInvoice } from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const eInvoiceStatusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'text-slate-700', bgColor: 'bg-slate-100', label: 'Bekliyor', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  Queued: { color: 'text-slate-700', bgColor: 'bg-slate-200', label: 'Kuyrukta', icon: <ArrowPathIcon className="w-4 h-4 animate-spin" /> },
  Sent: { color: 'text-slate-700', bgColor: 'bg-slate-300', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  Delivered: { color: 'text-slate-800', bgColor: 'bg-slate-400', label: 'Ulaştı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Accepted: { color: 'text-white', bgColor: 'bg-slate-700', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'text-white', bgColor: 'bg-slate-900', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Error: { color: 'text-white', bgColor: 'bg-slate-800', label: 'Hata', icon: <XCircleIcon className="w-4 h-4" /> },
};

const invoiceStatusConfig: Record<InvoiceStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: 'text-slate-600', bgColor: 'bg-slate-100', label: 'Taslak' },
  Issued: { color: 'text-slate-700', bgColor: 'bg-slate-200', label: 'Kesildi' },
  Sent: { color: 'text-slate-700', bgColor: 'bg-slate-300', label: 'Gönderildi' },
  PartiallyPaid: { color: 'text-slate-800', bgColor: 'bg-slate-400', label: 'Kısmi Ödendi' },
  Paid: { color: 'text-white', bgColor: 'bg-slate-700', label: 'Ödendi' },
  Overdue: { color: 'text-white', bgColor: 'bg-slate-800', label: 'Vadesi Geçmiş' },
  Cancelled: { color: 'text-white', bgColor: 'bg-slate-900', label: 'İptal' },
  Voided: { color: 'text-white', bgColor: 'bg-slate-900', label: 'Geçersiz' },
};

type TabKey = 'all' | 'pending' | 'sent' | 'history';

export default function EInvoicePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceListItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Form state for send modal
  const [eInvoiceId, setEInvoiceId] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings form state
  const [settingsProvider, setSettingsProvider] = useState('');
  const [settingsApiKey, setSettingsApiKey] = useState('');
  const [settingsSecretKey, setSettingsSecretKey] = useState('');
  const [settingsVkn, setSettingsVkn] = useState('');
  const [settingsMode, setSettingsMode] = useState('test');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const setEInvoice = useSetEInvoice();

  // Fetch invoices that are issued or e-invoice enabled
  const { data: invoicesData, isLoading, refetch } = useInvoices({
    status: statusFilter || undefined,
    searchTerm: searchTerm || undefined,
    fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate: toDate ? new Date(toDate).toISOString() : undefined,
    page,
    pageSize,
  });

  const invoices = invoicesData?.items ?? [];
  const totalCount = invoicesData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const eInvoices = invoices.filter(inv => inv.isEInvoice);
  const pendingEInvoices = eInvoices.filter(inv => inv.status === 'Issued');
  const sentEInvoices = eInvoices.filter(inv => inv.status === 'Sent');

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type });
  };

  const handleSendEInvoice = (invoice: InvoiceListItem) => {
    setCurrentInvoice(invoice);
    setEInvoiceId('');
    setFormError('');
    setSendModalOpen(true);
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) return;

    if (!eInvoiceId.trim()) {
      setFormError('E-Fatura UUID gereklidir');
      return;
    }

    setIsSubmitting(true);
    try {
      await setEInvoice.mutateAsync({
        id: currentInvoice.id,
        data: {
          eInvoiceId: eInvoiceId,
          eInvoiceStatus: 'Queued',
        },
      });
      showToast('E-Fatura gönderilmek üzere kuyruğa eklendi', 'success');
      setSendModalOpen(false);
      refetch();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'E-Fatura gönderilemedi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSend = () => {
    if (selectedInvoices.length === 0) {
      showToast('Lütfen göndermek için fatura seçiniz', 'warning');
      return;
    }

    if (confirm(`${selectedInvoices.length} adet fatura e-fatura olarak gönderilecek. Devam etmek istiyor musunuz?`)) {
      showToast('Toplu gönderim başlatıldı', 'info');
      setSelectedInvoices([]);
    }
  };

  const handleSelectAll = (checked: boolean, dataSource: InvoiceListItem[]) => {
    if (checked) {
      const selectableIds = dataSource
        .filter(inv => inv.status === 'Issued')
        .map(inv => inv.id);
      setSelectedInvoices(selectableIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, id]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(i => i !== id));
    }
  };

  const handleSettingsSave = () => {
    showToast('Ayarlar kaydedildi', 'info');
    setSettingsModalOpen(false);
  };

  const getDataSourceForTab = (): InvoiceListItem[] => {
    switch (activeTab) {
      case 'pending':
        return pendingEInvoices;
      case 'sent':
        return sentEInvoices;
      case 'all':
      default:
        return invoices;
    }
  };

  const renderTable = (dataSource: InvoiceListItem[], showSelection: boolean = false) => {
    const selectableData = dataSource.filter(inv => inv.status === 'Issued');
    const allSelected = selectableData.length > 0 && selectableData.every(inv => selectedInvoices.includes(inv.id));
    const someSelected = selectableData.some(inv => selectedInvoices.includes(inv.id));

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              {showSelection && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked, dataSource)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fatura No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Müşteri</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fatura Tarihi</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Tutar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fatura Durumu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">E-Fatura</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">E-Fatura Durumu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {dataSource.length === 0 ? (
              <tr>
                <td colSpan={showSelection ? 9 : 8} className="px-4 py-12 text-center text-slate-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Kayıt bulunamadı</p>
                </td>
              </tr>
            ) : (
              dataSource.map((record) => {
                const statusConfig = invoiceStatusConfig[record.status as InvoiceStatus];
                const eInvoiceStatus = 'Pending';
                const eStatusConfig = eInvoiceStatusConfig[eInvoiceStatus];
                const isSelectable = record.status === 'Issued';

                return (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    {showSelection && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(record.id)}
                          disabled={!isSelectable}
                          onChange={(e) => handleSelectOne(record.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-50"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => router.push(`/sales/invoices/${record.id}`)}
                        className="text-slate-900 hover:text-slate-700 font-medium hover:underline"
                      >
                        {record.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{record.customerName}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{dayjs(record.invoiceDate).format('DD/MM/YYYY')}</td>
                    <td className="px-4 py-4 text-sm text-slate-900 text-right font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(record.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {record.isEInvoice ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-white">
                          E-Fatura
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Klasik
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!record.isEInvoice ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${eStatusConfig.bgColor} ${eStatusConfig.color}`}>
                          {eStatusConfig.icon}
                          {eStatusConfig.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {record.status === 'Issued' && (
                          <button
                            onClick={() => handleSendEInvoice(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                            title="E-Fatura Gönder"
                          >
                            <PaperAirplaneIcon className="w-3.5 h-3.5" />
                            Gönder
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/sales/invoices/${record.id}`)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Detay"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-slate-800 text-white' :
          toast.type === 'error' ? 'bg-slate-900 text-white' :
          toast.type === 'warning' ? 'bg-slate-700 text-white' :
          'bg-slate-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {toast.type === 'error' && <XCircleIcon className="w-5 h-5" />}
            {toast.type === 'warning' && <ExclamationCircleIcon className="w-5 h-5" />}
            {toast.type === 'info' && <ExclamationCircleIcon className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-Fatura Yönetimi</h1>
          <p className="text-sm text-slate-500">E-Fatura ve E-Arşiv fatura işlemlerinizi yönetin</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam E-Fatura</p>
              <p className="text-xl font-bold text-slate-900">{eInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Gönderilmeyi Bekleyen</p>
              <p className="text-xl font-bold text-slate-900">{pendingEInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PaperAirplaneIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bu Ay Gönderilen</p>
              <p className="text-xl font-bold text-slate-900">{eInvoices.filter(inv => dayjs(inv.invoiceDate).isSame(dayjs(), 'month')).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Reddedilen</p>
              <p className="text-xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info Alert */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <ExclamationCircleIcon className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-900">E-Fatura Entegrasyonu</h3>
            <p className="text-sm text-slate-500 mt-1">
              E-Fatura gönderimi için GİB (Gelir İdaresi Başkanlığı) entegrasyonu gereklidir.
              Entegrasyon ayarlarını yapılandırmak için Ayarlar butonuna tıklayın.
            </p>
          </div>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Ayarlar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Fatura no, müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Issued">Kesilmiş</option>
            <option value="Sent">Gönderilmiş</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Yenile
            </button>
            {selectedInvoices.length > 0 && (
              <button
                onClick={handleBulkSend}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Seçilenleri Gönder ({selectedInvoices.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Tüm Faturalar
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Gönderilecekler
              {pendingEInvoices.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-slate-900 rounded-full">
                  {pendingEInvoices.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sent'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Gönderilenler
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              Gönderim Geçmişi
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : activeTab === 'history' ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ClockIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">E-Fatura gönderim geçmişi entegrasyon sonrası görüntülenecektir.</p>
            </div>
          ) : (
            <>
              {renderTable(getDataSourceForTab(), activeTab === 'all' || activeTab === 'pending')}

              {/* Pagination */}
              {activeTab === 'all' && totalCount > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 mt-4">
                  <div className="text-sm text-slate-500">
                    Toplam {totalCount} fatura
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value={10}>10 / sayfa</option>
                      <option value={20}>20 / sayfa</option>
                      <option value={50}>50 / sayfa</option>
                      <option value={100}>100 / sayfa</option>
                    </select>
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600">
                      {page} / {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Send E-Invoice Modal */}
      {sendModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSendModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">E-Fatura Gönder</h2>
                <button
                  onClick={() => setSendModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendSubmit} className="p-6">
                {currentInvoice && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Fatura No:</p>
                        <p className="text-sm font-medium text-slate-900">{currentInvoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Müşteri:</p>
                        <p className="text-sm font-medium text-slate-900">{currentInvoice.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tutar:</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tarih:</p>
                        <p className="text-sm font-medium text-slate-900">{dayjs(currentInvoice.invoiceDate).format('DD/MM/YYYY')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-Fatura UUID
                  </label>
                  <input
                    type="text"
                    value={eInvoiceId}
                    onChange={(e) => {
                      setEInvoiceId(e.target.value);
                      setFormError('');
                    }}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                      formError ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  {formError && (
                    <p className="mt-1 text-xs text-red-600">{formError}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    GİB tarafından otomatik üretilecektir. Manuel giriş için boş bırakabilirsiniz.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Bilgi</p>
                      <p className="text-xs text-slate-500">E-Fatura gönderildikten sonra iptal edilemez. Lütfen fatura bilgilerini kontrol ediniz.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSendModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSettingsModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">E-Fatura Ayarları</h2>
                <button
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">GİB Entegrasyonu</p>
                      <p className="text-xs text-slate-500">E-Fatura göndermek için GİB (Gelir İdaresi Başkanlığı) ile entegrasyon yapmanız gerekmektedir. Entegrasyon için bir e-fatura servis sağlayıcısı ile çalışmanız önerilir.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      E-Fatura Servis Sağlayıcısı
                    </label>
                    <select
                      value={settingsProvider}
                      onChange={(e) => setSettingsProvider(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      <option value="">Servis sağlayıcı seçin</option>
                      <option value="foriba">Foriba</option>
                      <option value="logo">Logo e-Fatura</option>
                      <option value="kolaysoft">KolaySoft</option>
                      <option value="efatura">E-Fatura.gov.tr</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">Kullanılan e-fatura entegratörü</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      API Anahtarı
                    </label>
                    <input
                      type="password"
                      value={settingsApiKey}
                      onChange={(e) => setSettingsApiKey(e.target.value)}
                      placeholder="API anahtarınızı giriniz"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500">Servis sağlayıcınızdan aldığınız API anahtarı</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      API Gizli Anahtarı
                    </label>
                    <input
                      type="password"
                      value={settingsSecretKey}
                      onChange={(e) => setSettingsSecretKey(e.target.value)}
                      placeholder="Gizli anahtarınızı giriniz"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500">Servis sağlayıcınızdan aldığınız gizli anahtar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Şirket VKN/TCKN
                    </label>
                    <input
                      type="text"
                      value={settingsVkn}
                      onChange={(e) => setSettingsVkn(e.target.value)}
                      placeholder="Vergi kimlik numaranızı giriniz"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500">Fatura kesecek şirketin vergi/TC kimlik numarası</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Test Modu
                    </label>
                    <select
                      value={settingsMode}
                      onChange={(e) => setSettingsMode(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      <option value="test">Test Modu (Aktif)</option>
                      <option value="production">Üretim Modu</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">Test modunda faturalar gerçekte gönderilmez</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSettingsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    type="button"
                    onClick={handleSettingsSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
