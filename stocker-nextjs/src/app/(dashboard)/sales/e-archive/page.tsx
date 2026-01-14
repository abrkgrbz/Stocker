'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  FunnelIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

// E-Arşiv Fatura Durumları
type EArchiveStatus = 'draft' | 'sent' | 'delivered' | 'cancelled' | 'failed';

interface EArchiveInvoice {
  id: string;
  invoiceNo: string;
  uuid: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerTaxNo: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  vatAmount: number;
  withholdingAmount: number;
  totalAmount: number;
  status: EArchiveStatus;
  deliveryMethod: 'email' | 'sms' | 'portal';
  gibSubmitDate: string | null;
  gibResponseDate: string | null;
  gibStatusCode: string | null;
  pdfUrl: string | null;
  xmlUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockEArchiveInvoices: EArchiveInvoice[] = [
  {
    id: '1',
    invoiceNo: 'EAR2024000001',
    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    customerName: 'Ahmet Yılmaz',
    customerTaxNo: '12345678901',
    customerEmail: 'ahmet.yilmaz@email.com',
    customerPhone: '05551234567',
    subtotal: 8500,
    vatAmount: 1700,
    withholdingAmount: 0,
    totalAmount: 10200,
    status: 'delivered',
    deliveryMethod: 'email',
    gibSubmitDate: '2024-01-15T10:30:00',
    gibResponseDate: '2024-01-15T10:31:00',
    gibStatusCode: '1100',
    pdfUrl: '/invoices/EAR2024000001.pdf',
    xmlUrl: '/invoices/EAR2024000001.xml',
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:31:00',
  },
  {
    id: '2',
    invoiceNo: 'EAR2024000002',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    invoiceDate: '2024-01-16',
    dueDate: '2024-02-16',
    customerName: 'Fatma Kaya',
    customerTaxNo: '98765432109',
    customerEmail: 'fatma.kaya@email.com',
    customerPhone: '05559876543',
    subtotal: 12000,
    vatAmount: 2400,
    withholdingAmount: 480,
    totalAmount: 13920,
    status: 'sent',
    deliveryMethod: 'sms',
    gibSubmitDate: '2024-01-16T14:00:00',
    gibResponseDate: null,
    gibStatusCode: null,
    pdfUrl: '/invoices/EAR2024000002.pdf',
    xmlUrl: '/invoices/EAR2024000002.xml',
    createdAt: '2024-01-16T13:45:00',
    updatedAt: '2024-01-16T14:00:00',
  },
  {
    id: '3',
    invoiceNo: 'EAR2024000003',
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    invoiceDate: '2024-01-17',
    dueDate: '2024-02-17',
    customerName: 'Mehmet Demir',
    customerTaxNo: '11223344556',
    customerEmail: 'mehmet.demir@email.com',
    customerPhone: '05551122334',
    subtotal: 5600,
    vatAmount: 1120,
    withholdingAmount: 0,
    totalAmount: 6720,
    status: 'draft',
    deliveryMethod: 'email',
    gibSubmitDate: null,
    gibResponseDate: null,
    gibStatusCode: null,
    pdfUrl: null,
    xmlUrl: null,
    createdAt: '2024-01-17T09:00:00',
    updatedAt: '2024-01-17T09:00:00',
  },
  {
    id: '4',
    invoiceNo: 'EAR2024000004',
    uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    invoiceDate: '2024-01-10',
    dueDate: '2024-02-10',
    customerName: 'Ayşe Öztürk',
    customerTaxNo: '55667788990',
    customerEmail: 'ayse.ozturk@email.com',
    customerPhone: '05555566778',
    subtotal: 3200,
    vatAmount: 640,
    withholdingAmount: 0,
    totalAmount: 3840,
    status: 'cancelled',
    deliveryMethod: 'email',
    gibSubmitDate: '2024-01-10T11:00:00',
    gibResponseDate: '2024-01-12T09:00:00',
    gibStatusCode: '1300',
    pdfUrl: '/invoices/EAR2024000004.pdf',
    xmlUrl: '/invoices/EAR2024000004.xml',
    createdAt: '2024-01-10T10:30:00',
    updatedAt: '2024-01-12T09:00:00',
  },
];

export default function EArchivePage() {
  const [invoices, setInvoices] = useState<EArchiveInvoice[]>(mockEArchiveInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EArchiveStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EArchiveInvoice | null>(null);

  // Send form states
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'portal'>('email');
  const [sendEmail, setSendEmail] = useState('');
  const [sendPhone, setSendPhone] = useState('');

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerTaxNo.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    const invoiceDate = new Date(invoice.invoiceDate);
    const matchesDateFrom = !dateFrom || invoiceDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || invoiceDate <= new Date(dateTo);

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleSendInvoice = () => {
    if (!selectedInvoice) return;

    // Simulate sending
    const updatedInvoices = invoices.map(inv =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            status: 'sent' as EArchiveStatus,
            deliveryMethod: sendMethod,
            customerEmail: sendMethod === 'email' ? sendEmail : inv.customerEmail,
            customerPhone: sendMethod === 'sms' ? sendPhone : inv.customerPhone,
            gibSubmitDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : inv
    );

    setInvoices(updatedInvoices);
    setSendModalOpen(false);
    setSelectedInvoice(null);
    setToast({ message: 'E-Arşiv fatura başarıyla gönderildi', type: 'success' });
  };

  const handleCancelInvoice = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.map(inv =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            status: 'cancelled' as EArchiveStatus,
            updatedAt: new Date().toISOString(),
          }
        : inv
    );

    setInvoices(updatedInvoices);
    setCancelModalOpen(false);
    setSelectedInvoice(null);
    setToast({ message: 'E-Arşiv fatura başarıyla iptal edildi', type: 'success' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status: EArchiveStatus) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak' };
      case 'sent':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' };
      case 'delivered':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Teslim Edildi' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal' };
      case 'failed':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Başarısız' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'email':
        return 'E-posta';
      case 'sms':
        return 'SMS';
      case 'portal':
        return 'Portal';
      default:
        return method;
    }
  };

  // Stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    delivered: invoices.filter(i => i.status === 'delivered').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <DocumentDuplicateIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">E-Arşiv Fatura</h1>
                <p className="text-slate-500 mt-1">GİB e-Arşiv fatura yönetimi</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/sales/invoices/new?type=e-archive'}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Yeni E-Arşiv Fatura
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Taslak</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.draft}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Gönderildi</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.sent}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Teslim</p>
                <p className="text-2xl font-semibold text-green-600">{stats.delivered}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">İptal</p>
                <p className="text-2xl font-semibold text-red-600">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Fatura no, müşteri adı veya VKN ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EArchiveStatus | 'all')}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="sent">Gönderildi</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal</option>
                <option value="failed">Başarısız</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                placeholder="Başlangıç"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                placeholder="Bitiş"
              />
            </div>
            {(statusFilter !== 'all' || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fatura No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Gönderim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{invoice.invoiceNo}</p>
                          <p className="text-xs text-slate-400 font-mono">{invoice.uuid.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{formatDate(invoice.invoiceDate)}</p>
                        <p className="text-xs text-slate-500">Vade: {formatDate(invoice.dueDate)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{invoice.customerName}</p>
                        <p className="text-xs text-slate-500">{invoice.customerTaxNo}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                        <p className="text-xs text-slate-500">KDV: {formatCurrency(invoice.vatAmount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {invoice.deliveryMethod === 'email' && <EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                          <span className="text-sm text-slate-600">{getDeliveryMethodLabel(invoice.deliveryMethod)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setViewModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {invoice.pdfUrl && (
                            <button
                              onClick={() => setToast({ message: 'PDF indiriliyor...', type: 'success' })}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="PDF İndir"
                            >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                          )}
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setSendEmail(invoice.customerEmail);
                                setSendPhone(invoice.customerPhone);
                                setSendModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Gönder"
                            >
                              <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                          )}
                          {invoice.pdfUrl && (
                            <button
                              onClick={() => setToast({ message: 'Yazdırılıyor...', type: 'success' })}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Yazdır"
                            >
                              <PrinterIcon className="w-5 h-5" />
                            </button>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'delivered') && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setCancelModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="İptal Et"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="px-6 py-12 text-center">
              <DocumentDuplicateIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">E-Arşiv fatura bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedInvoice && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setViewModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-slate-900">E-Arşiv Fatura Detayı</h3>
                <button onClick={() => setViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Invoice Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedInvoice.invoiceNo}</h4>
                    <p className="text-sm text-slate-500 font-mono mt-1">UUID: {selectedInvoice.uuid}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${getStatusBadge(selectedInvoice.status).bg} ${getStatusBadge(selectedInvoice.status).text}`}>
                    {getStatusBadge(selectedInvoice.status).label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3">Müşteri Bilgileri</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Ad Soyad / Ünvan</p>
                      <p className="text-sm font-medium text-slate-900">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">VKN / TCKN</p>
                      <p className="text-sm font-medium text-slate-900">{selectedInvoice.customerTaxNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">E-posta</p>
                      <p className="text-sm font-medium text-slate-900">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Telefon</p>
                      <p className="text-sm font-medium text-slate-900">{selectedInvoice.customerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Fatura Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(selectedInvoice.invoiceDate)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Vade Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Amounts */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3">Tutar Bilgileri</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Ara Toplam</span>
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">KDV</span>
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(selectedInvoice.vatAmount)}</span>
                    </div>
                    {selectedInvoice.withholdingAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Tevkifat</span>
                        <span className="text-sm font-medium text-amber-600">-{formatCurrency(selectedInvoice.withholdingAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">Genel Toplam</span>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* GİB Status */}
                {selectedInvoice.gibSubmitDate && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-semibold text-blue-800 mb-3">GİB Bilgileri</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-600">Gönderim Tarihi</p>
                        <p className="text-sm font-medium text-blue-900">{new Date(selectedInvoice.gibSubmitDate).toLocaleString('tr-TR')}</p>
                      </div>
                      {selectedInvoice.gibResponseDate && (
                        <div>
                          <p className="text-xs text-blue-600">Yanıt Tarihi</p>
                          <p className="text-sm font-medium text-blue-900">{new Date(selectedInvoice.gibResponseDate).toLocaleString('tr-TR')}</p>
                        </div>
                      )}
                      {selectedInvoice.gibStatusCode && (
                        <div>
                          <p className="text-xs text-blue-600">Durum Kodu</p>
                          <p className="text-sm font-medium text-blue-900">{selectedInvoice.gibStatusCode}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-blue-600">Gönderim Yöntemi</p>
                        <p className="text-sm font-medium text-blue-900">{getDeliveryMethodLabel(selectedInvoice.deliveryMethod)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                {selectedInvoice.pdfUrl && (
                  <button
                    onClick={() => setToast({ message: 'PDF indiriliyor...', type: 'success' })}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    PDF İndir
                  </button>
                )}
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Send Modal */}
      {sendModalOpen && selectedInvoice && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSendModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">E-Arşiv Fatura Gönder</h3>
                <button onClick={() => setSendModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">{selectedInvoice.invoiceNo}</p>
                  <p className="text-sm text-slate-500">{selectedInvoice.customerName} - {formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gönderim Yöntemi</label>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setSendMethod('email')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        sendMethod === 'email'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      E-posta
                    </button>
                    <button
                      onClick={() => setSendMethod('sms')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        sendMethod === 'sms'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      SMS
                    </button>
                    <button
                      onClick={() => setSendMethod('portal')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        sendMethod === 'portal'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Portal
                    </button>
                  </div>
                </div>

                {sendMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-posta Adresi</label>
                    <input
                      type="email"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                )}

                {sendMethod === 'sms' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefon Numarası</label>
                    <input
                      type="tel"
                      value={sendPhone}
                      onChange={(e) => setSendPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                )}

                {sendMethod === 'portal' && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      Fatura, müşterinin GİB portalına gönderilecektir. Müşteri faturayı GİB Portal üzerinden görüntüleyebilecektir.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setSendModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSendInvoice}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && selectedInvoice && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setCancelModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Faturayı İptal Et</h3>
                <p className="text-sm text-slate-500 text-center">
                  "{selectedInvoice.invoiceNo}" numaralı e-arşiv faturayı iptal etmek istediğinizden emin misiniz?
                </p>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Dikkat:</strong> İptal edilen faturalar GİB sisteminde iptal olarak işaretlenir ve geri alınamaz.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleCancelInvoice}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  İptal Et
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
