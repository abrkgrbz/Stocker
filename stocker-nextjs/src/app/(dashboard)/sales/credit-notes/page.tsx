'use client';

/**
 * Credit Notes Page
 * Handle returns and refunds (The "Anti-Invoice")
 * Financial document list with RED amounts indicating money leaving
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, message, Select } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  FileText,
  Search,
  MoreVertical,
  Eye,
  Printer,
  Download,
  AlertTriangle,
  Package,
  RotateCcw,
  Ban,
  Calendar,
  Hash,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { DocumentMinusIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import SalesService, {
  CreditNoteListDto,
  CreditNoteDto,
  CreditNoteStatisticsDto,
  CreditNoteStatus,
  CreditNoteReason,
} from '@/lib/api/services/sales.service';

dayjs.locale('tr');

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNoteListDto[]>([]);
  const [statistics, setStatistics] = useState<CreditNoteStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CreditNoteStatus | 'All'>('All');
  const [reasonFilter, setReasonFilter] = useState<CreditNoteReason | 'All'>('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditNoteDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notesResult, statsResult] = await Promise.all([
        SalesService.getCreditNotes({
          searchTerm: searchTerm || undefined,
          status: statusFilter === 'All' ? undefined : statusFilter,
          reason: reasonFilter === 'All' ? undefined : reasonFilter,
          pageSize: 100,
        }),
        SalesService.getCreditNoteStatistics(),
      ]);
      setCreditNotes(notesResult.items);
      setStatistics(statsResult);
    } catch (error) {
      console.error('Failed to fetch credit notes:', error);
      message.error('Alacak dekontları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, reasonFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bgColor: string; textColor: string }> = {
      Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
      Pending: { label: 'Beklemede', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
      Approved: { label: 'Onaylandı', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
      Applied: { label: 'Uygulandı', bgColor: 'bg-green-50', textColor: 'text-green-700' },
      Voided: { label: 'İptal Edildi', bgColor: 'bg-red-50', textColor: 'text-red-600' },
      Cancelled: { label: 'İptal', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    };
    return configs[status] || configs['Draft'];
  };

  const getReasonConfig = (reason: string) => {
    const configs: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
      Return: { label: 'İade', icon: RotateCcw, color: 'text-amber-600' },
      Defective: { label: 'Arızalı Ürün', icon: Ban, color: 'text-red-600' },
      PricingError: { label: 'Fiyat Hatası', icon: AlertTriangle, color: 'text-orange-600' },
      Discount: { label: 'İndirim', icon: RotateCcw, color: 'text-blue-600' },
      Cancellation: { label: 'İptal', icon: Ban, color: 'text-red-600' },
      Goodwill: { label: 'İyi Niyet', icon: FileText, color: 'text-green-600' },
      Other: { label: 'Diğer', icon: FileText, color: 'text-slate-600' },
    };
    return configs[reason] || configs['Other'];
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewDetail = async (noteId: string) => {
    try {
      setDetailLoading(true);
      setOpenDropdown(null);
      const note = await SalesService.getCreditNote(noteId);
      setSelectedNote(note);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch credit note details:', error);
      message.error('Dekont detayları yüklenirken hata oluştu');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<DocumentMinusIcon className="w-5 h-5" />}
        iconColor="#dc2626"
        title="Alacak Dekontları"
        description="İade ve geri ödemeleri yönetin (Kontra Fatura)"
        itemCount={creditNotes.length}
        secondaryActions={
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Dekont</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {statistics?.totalCount ?? creditNotes.length}
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Alacak</span>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 font-mono">
            -{statistics ? formatCurrency(statistics.totalAmount, statistics.currency) : '₺0,00'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Uygulanan</span>
            <RotateCcw className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600 font-mono">
            -{statistics ? formatCurrency(statistics.appliedAmount, statistics.currency) : '₺0,00'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bekleyen</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-600 font-mono">
            -{statistics ? formatCurrency(statistics.remainingAmount, statistics.currency) : '₺0,00'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dekont no, fatura no veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            value={statusFilter === 'All' ? undefined : statusFilter}
            onChange={(value) => setStatusFilter(value || 'All')}
            style={{ width: 150 }}
            options={[
              { value: 'Draft', label: 'Taslak' },
              { value: 'Pending', label: 'Beklemede' },
              { value: 'Approved', label: 'Onaylandı' },
              { value: 'Applied', label: 'Uygulandı' },
              { value: 'Voided', label: 'İptal Edildi' },
            ]}
          />
          <Select
            placeholder="Sebep"
            allowClear
            value={reasonFilter === 'All' ? undefined : reasonFilter}
            onChange={(value) => setReasonFilter(value || 'All')}
            style={{ width: 160 }}
            options={[
              { value: 'Return', label: 'İade' },
              { value: 'Defective', label: 'Arızalı Ürün' },
              { value: 'PricingError', label: 'Fiyat Hatası' },
              { value: 'Discount', label: 'İndirim' },
              { value: 'Cancellation', label: 'İptal' },
              { value: 'Goodwill', label: 'İyi Niyet' },
              { value: 'Other', label: 'Diğer' },
            ]}
          />
        </div>
      </Card>

      {/* Credit Notes Table */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : creditNotes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Alacak dekontu bulunamadı"
            description="Arama kriterlerinize uygun dekont yok"
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Dekont No
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Tarih
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Orijinal Fatura
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Müşteri
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Sebep
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    İade Tutarı
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Durum
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditNotes.map((note) => {
                  const statusConfig = getStatusConfig(note.status);
                  const reasonConfig = getReasonConfig(note.reason);
                  const ReasonIcon = reasonConfig.icon;

                  return (
                    <tr
                      key={note.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        note.status === 'Voided' ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <span className="font-mono font-medium text-slate-900">
                            {note.creditNoteNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {dayjs(note.creditNoteDate).format('DD MMM YYYY')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-indigo-600 hover:underline cursor-pointer">
                          {note.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{note.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ReasonIcon className={`w-4 h-4 ${reasonConfig.color}`} />
                          <span className="text-sm text-slate-700">{reasonConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-lg font-bold text-red-600">
                          -{formatCurrency(note.totalAmount, note.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === note.id ? null : note.id)
                            }
                            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                          {openDropdown === note.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleViewDetail(note.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Görüntüle
                                  </button>
                                  <button
                                    onClick={() => {
                                      message.info('Yazdırma özelliği...');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                    <Printer className="w-4 h-4" />
                                    Yazdır
                                  </button>
                                  <button
                                    onClick={() => {
                                      message.info('PDF indirme...');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                    <Download className="w-4 h-4" />
                                    PDF İndir
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span>Alacak Dekontu Detayı</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedNote(null);
        }}
        footer={null}
        width={650}
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : selectedNote ? (
          <div className="space-y-6 py-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Dekont No</div>
                <div className="font-mono font-semibold text-slate-900">{selectedNote.creditNoteNumber}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Orijinal Fatura</div>
                <div className="font-mono text-indigo-600">{selectedNote.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Müşteri</div>
                <div className="font-medium text-slate-900">{selectedNote.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tarih</div>
                <div className="text-slate-700">{dayjs(selectedNote.creditNoteDate).format('DD MMMM YYYY')}</div>
              </div>
            </div>

            {/* Reason */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-700 uppercase tracking-wide mb-1">İade Sebebi</div>
              <div className="font-medium text-amber-900">
                {getReasonConfig(selectedNote.reason).label}
              </div>
              {selectedNote.reasonDescription && (
                <div className="text-sm text-amber-700 mt-1">{selectedNote.reasonDescription}</div>
              )}
            </div>

            {/* Items */}
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Kalemler</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Ürün</th>
                      <th className="text-right text-xs font-medium text-slate-500 px-4 py-2">Adet</th>
                      <th className="text-right text-xs font-medium text-slate-500 px-4 py-2">Birim Fiyat</th>
                      <th className="text-right text-xs font-medium text-slate-500 px-4 py-2">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNote.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{item.productName}</div>
                          <div className="text-xs text-slate-500 font-mono">{item.productCode}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-red-600">
                          -{formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ara Toplam</span>
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">KDV</span>
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Toplam İade</span>
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.totalAmount)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
