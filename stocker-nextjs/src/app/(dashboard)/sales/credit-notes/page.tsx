'use client';

/**
 * Credit Notes Page
 * Handle returns and refunds (The "Anti-Invoice")
 * Monochrome design system
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
  RotateCcw,
  Ban,
  Calendar,
  Hash,
  ArrowDownRight,
  RefreshCw,
  FileMinus,
} from 'lucide-react';
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
      message.error('Alacak dekontlari yuklenirken hata olustu');
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
      Pending: { label: 'Beklemede', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
      Approved: { label: 'Onaylandi', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
      Applied: { label: 'Uygulandi', bgColor: 'bg-slate-900', textColor: 'text-white' },
      Voided: { label: 'Iptal Edildi', bgColor: 'bg-slate-400', textColor: 'text-white' },
      Cancelled: { label: 'Iptal', bgColor: 'bg-slate-400', textColor: 'text-white' },
    };
    return configs[status] || configs['Draft'];
  };

  const getReasonConfig = (reason: string) => {
    const configs: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
      Return: { label: 'Iade', icon: RotateCcw, color: 'text-slate-600' },
      Defective: { label: 'Arizali Urun', icon: Ban, color: 'text-slate-700' },
      PricingError: { label: 'Fiyat Hatasi', icon: AlertTriangle, color: 'text-slate-600' },
      Discount: { label: 'Indirim', icon: RotateCcw, color: 'text-slate-500' },
      Cancellation: { label: 'Iptal', icon: Ban, color: 'text-slate-700' },
      Goodwill: { label: 'Iyi Niyet', icon: FileText, color: 'text-slate-500' },
      Other: { label: 'Diger', icon: FileText, color: 'text-slate-500' },
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
      message.error('Dekont detaylari yuklenirken hata olustu');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <FileMinus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Alacak Dekontlari</h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {creditNotes.length} dekont
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Iade ve geri odemeleri yonetin (Kontra Fatura)
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {statistics?.totalCount ?? creditNotes.length}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Dekont</div>
        </div>
        <div className="bg-white border border-slate-300 rounded-xl p-5 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            -{statistics ? formatCurrency(statistics.totalAmount, statistics.currency) : '₺0,00'}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Alacak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            -{statistics ? formatCurrency(statistics.appliedAmount, statistics.currency) : '₺0,00'}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Uygulanan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            -{statistics ? formatCurrency(statistics.remainingAmount, statistics.currency) : '₺0,00'}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dekont no, fatura no veya musteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
              { value: 'Approved', label: 'Onaylandi' },
              { value: 'Applied', label: 'Uygulandi' },
              { value: 'Voided', label: 'Iptal Edildi' },
            ]}
          />
          <Select
            placeholder="Sebep"
            allowClear
            value={reasonFilter === 'All' ? undefined : reasonFilter}
            onChange={(value) => setReasonFilter(value || 'All')}
            style={{ width: 160 }}
            options={[
              { value: 'Return', label: 'Iade' },
              { value: 'Defective', label: 'Arizali Urun' },
              { value: 'PricingError', label: 'Fiyat Hatasi' },
              { value: 'Discount', label: 'Indirim' },
              { value: 'Cancellation', label: 'Iptal' },
              { value: 'Goodwill', label: 'Iyi Niyet' },
              { value: 'Other', label: 'Diger' },
            ]}
          />
        </div>
      </div>

      {/* Credit Notes Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      ) : creditNotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Alacak dekontu bulunamadi</h3>
          <p className="text-slate-500">Arama kriterlerinize uygun dekont yok</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Dekont No
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Tarih
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Orijinal Fatura
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Musteri
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Sebep
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Iade Tutari
                  </th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Durum
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Islem
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
                      className={
                        'hover:bg-slate-50 transition-colors ' +
                        (note.status === 'Voided' ? 'opacity-50' : '')
                      }
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
                        <span className="font-mono text-sm text-slate-600 hover:underline cursor-pointer">
                          {note.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{note.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ReasonIcon className={'w-4 h-4 ' + reasonConfig.color} />
                          <span className="text-sm text-slate-700">{reasonConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-lg font-bold text-slate-900">
                          -{formatCurrency(note.totalAmount, note.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ' + statusConfig.bgColor + ' ' + statusConfig.textColor}
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
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
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
                                    Goruntule
                                  </button>
                                  <button
                                    onClick={() => {
                                      message.info('Yazdirma ozelligi...');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                    <Printer className="w-4 h-4" />
                                    Yazdir
                                  </button>
                                  <button
                                    onClick={() => {
                                      message.info('PDF indirme...');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                    <Download className="w-4 h-4" />
                                    PDF Indir
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
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <span>Alacak Dekontu Detayi</span>
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
                <div className="font-mono text-slate-600">{selectedNote.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Musteri</div>
                <div className="font-medium text-slate-900">{selectedNote.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tarih</div>
                <div className="text-slate-700">{dayjs(selectedNote.creditNoteDate).format('DD MMMM YYYY')}</div>
              </div>
            </div>

            {/* Reason */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Iade Sebebi</div>
              <div className="font-medium text-slate-900">
                {getReasonConfig(selectedNote.reason).label}
              </div>
              {selectedNote.reasonDescription && (
                <div className="text-sm text-slate-600 mt-1">{selectedNote.reasonDescription}</div>
              )}
            </div>

            {/* Items */}
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Kalemler</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Urun</th>
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
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
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
                <span className="font-mono text-slate-900">-{formatCurrency(selectedNote.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">KDV</span>
                <span className="font-mono text-slate-900">-{formatCurrency(selectedNote.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Toplam Iade</span>
                <span className="font-mono text-slate-900">-{formatCurrency(selectedNote.totalAmount)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
