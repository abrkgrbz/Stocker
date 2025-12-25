'use client';

/**
 * Credit Notes Page
 * Handle returns and refunds (The "Anti-Invoice")
 * Financial document list with RED amounts indicating money leaving
 */

import React, { useState } from 'react';
import { Modal, message, Select } from 'antd';
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
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { FileExclamationOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type CreditNoteStatus = 'Draft' | 'Issued' | 'Applied' | 'Cancelled';
type CreditReason = 'Damaged' | 'WrongItem' | 'Defective' | 'PriceAdjustment' | 'CustomerReturn' | 'Other';

interface CreditNoteItem {
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreditNote {
  id: string;
  noteNumber: string;
  issueDate: string;
  originalInvoiceNumber: string;
  originalInvoiceId: string;
  customerId: string;
  customerName: string;
  reason: CreditReason;
  reasonDetail?: string;
  items: CreditNoteItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: CreditNoteStatus;
  appliedAt: string | null;
  createdBy: string;
}

// Mock data
const mockCreditNotes: CreditNote[] = [
  {
    id: '1',
    noteNumber: 'CN-2024-000123',
    issueDate: '2024-12-24T10:00:00',
    originalInvoiceNumber: 'INV-2024-005678',
    originalInvoiceId: 'inv1',
    customerId: 'c1',
    customerName: 'MediaMarkt Turkey',
    reason: 'Damaged',
    reasonDetail: 'Kargo sırasında hasar gördü',
    items: [
      { productName: 'iPhone 15 Pro Max', productSku: 'APL-IP15PM-256', quantity: 2, unitPrice: 55000, totalPrice: 110000 },
    ],
    subtotal: 110000,
    taxAmount: 22000,
    totalAmount: 132000,
    currency: 'TRY',
    status: 'Issued',
    appliedAt: null,
    createdBy: 'Ahmet Yılmaz',
  },
  {
    id: '2',
    noteNumber: 'CN-2024-000122',
    issueDate: '2024-12-23T14:30:00',
    originalInvoiceNumber: 'INV-2024-005650',
    originalInvoiceId: 'inv2',
    customerId: 'c2',
    customerName: 'Teknosa A.Ş.',
    reason: 'WrongItem',
    reasonDetail: 'Yanlış ürün gönderildi',
    items: [
      { productName: 'Samsung Galaxy S24', productSku: 'SAM-S24-256', quantity: 5, unitPrice: 42000, totalPrice: 210000 },
    ],
    subtotal: 210000,
    taxAmount: 42000,
    totalAmount: 252000,
    currency: 'TRY',
    status: 'Applied',
    appliedAt: '2024-12-24T09:00:00',
    createdBy: 'Zeynep Kaya',
  },
  {
    id: '3',
    noteNumber: 'CN-2024-000121',
    issueDate: '2024-12-22T11:15:00',
    originalInvoiceNumber: 'INV-2024-005620',
    originalInvoiceId: 'inv3',
    customerId: 'c3',
    customerName: 'Hepsiburada',
    reason: 'Defective',
    reasonDetail: 'Fabrikasyon hatası',
    items: [
      { productName: 'MacBook Pro 14" M3', productSku: 'APL-MBP14-M3', quantity: 1, unitPrice: 85000, totalPrice: 85000 },
      { productName: 'Apple Magic Mouse', productSku: 'APL-MM', quantity: 1, unitPrice: 3500, totalPrice: 3500 },
    ],
    subtotal: 88500,
    taxAmount: 17700,
    totalAmount: 106200,
    currency: 'TRY',
    status: 'Issued',
    appliedAt: null,
    createdBy: 'Mehmet Demir',
  },
  {
    id: '4',
    noteNumber: 'CN-2024-000120',
    issueDate: '2024-12-21T09:00:00',
    originalInvoiceNumber: 'INV-2024-005600',
    originalInvoiceId: 'inv4',
    customerId: 'c4',
    customerName: 'Vatan Bilgisayar',
    reason: 'PriceAdjustment',
    reasonDetail: 'Kampanya fiyat farkı',
    items: [
      { productName: 'Dell XPS 15', productSku: 'DEL-XPS15-I7', quantity: 3, unitPrice: 5000, totalPrice: 15000 },
    ],
    subtotal: 15000,
    taxAmount: 3000,
    totalAmount: 18000,
    currency: 'TRY',
    status: 'Applied',
    appliedAt: '2024-12-21T15:00:00',
    createdBy: 'Can Arslan',
  },
  {
    id: '5',
    noteNumber: 'CN-2024-000119',
    issueDate: '2024-12-20T16:45:00',
    originalInvoiceNumber: 'INV-2024-005580',
    originalInvoiceId: 'inv5',
    customerId: 'c5',
    customerName: 'n11.com',
    reason: 'CustomerReturn',
    reasonDetail: 'Müşteri cayma hakkını kullandı',
    items: [
      { productName: 'Sony WH-1000XM5', productSku: 'SNY-WH1000XM5', quantity: 10, unitPrice: 12000, totalPrice: 120000 },
    ],
    subtotal: 120000,
    taxAmount: 24000,
    totalAmount: 144000,
    currency: 'TRY',
    status: 'Draft',
    appliedAt: null,
    createdBy: 'Elif Özcan',
  },
  {
    id: '6',
    noteNumber: 'CN-2024-000118',
    issueDate: '2024-12-19T10:30:00',
    originalInvoiceNumber: 'INV-2024-005550',
    originalInvoiceId: 'inv6',
    customerId: 'c6',
    customerName: 'Trendyol',
    reason: 'Other',
    reasonDetail: 'Sözleşme feshi',
    items: [
      { productName: 'iPad Pro 12.9"', productSku: 'APL-IPADP-129', quantity: 8, unitPrice: 45000, totalPrice: 360000 },
    ],
    subtotal: 360000,
    taxAmount: 72000,
    totalAmount: 432000,
    currency: 'TRY',
    status: 'Cancelled',
    appliedAt: null,
    createdBy: 'Deniz Yıldız',
  },
];

export default function CreditNotesPage() {
  const [creditNotes] = useState<CreditNote[]>(mockCreditNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CreditNoteStatus | 'All'>('All');
  const [reasonFilter, setReasonFilter] = useState<CreditReason | 'All'>('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);

  const getStatusConfig = (status: CreditNoteStatus) => {
    const configs = {
      Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
      Issued: { label: 'Düzenlendi', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
      Applied: { label: 'Uygulandı', bgColor: 'bg-green-50', textColor: 'text-green-700' },
      Cancelled: { label: 'İptal', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    };
    return configs[status];
  };

  const getReasonConfig = (reason: CreditReason) => {
    const configs = {
      Damaged: { label: 'Hasarlı Ürün', icon: AlertTriangle, color: 'text-orange-600' },
      WrongItem: { label: 'Yanlış Ürün', icon: Package, color: 'text-purple-600' },
      Defective: { label: 'Arızalı Ürün', icon: Ban, color: 'text-red-600' },
      PriceAdjustment: { label: 'Fiyat Düzeltme', icon: RotateCcw, color: 'text-blue-600' },
      CustomerReturn: { label: 'Müşteri İadesi', icon: RotateCcw, color: 'text-amber-600' },
      Other: { label: 'Diğer', icon: FileText, color: 'text-slate-600' },
    };
    return configs[reason];
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewDetail = (note: CreditNote) => {
    setSelectedNote(note);
    setDetailModalOpen(true);
    setOpenDropdown(null);
  };

  // Filter
  const filteredNotes = creditNotes.filter((note) => {
    const matchesSearch =
      note.noteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.originalInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || note.status === statusFilter;
    const matchesReason = reasonFilter === 'All' || note.reason === reasonFilter;

    return matchesSearch && matchesStatus && matchesReason;
  });

  // Summary calculations
  const totalCreditAmount = creditNotes
    .filter((n) => n.status !== 'Cancelled')
    .reduce((sum, n) => sum + n.totalAmount, 0);
  const appliedAmount = creditNotes
    .filter((n) => n.status === 'Applied')
    .reduce((sum, n) => sum + n.totalAmount, 0);
  const pendingAmount = creditNotes
    .filter((n) => n.status === 'Issued' || n.status === 'Draft')
    .reduce((sum, n) => sum + n.totalAmount, 0);

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<FileExclamationOutlined />}
        iconColor="#dc2626"
        title="Alacak Dekontları"
        description="İade ve geri ödemeleri yönetin (Kontra Fatura)"
        itemCount={creditNotes.filter((n) => n.status !== 'Cancelled').length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Dekont</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {creditNotes.filter((n) => n.status !== 'Cancelled').length}
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Alacak</span>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 font-mono">
            -{formatCurrency(totalCreditAmount)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Uygulanan</span>
            <RotateCcw className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600 font-mono">
            -{formatCurrency(appliedAmount)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bekleyen</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-600 font-mono">
            -{formatCurrency(pendingAmount)}
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
              { value: 'Issued', label: 'Düzenlendi' },
              { value: 'Applied', label: 'Uygulandı' },
              { value: 'Cancelled', label: 'İptal' },
            ]}
          />
          <Select
            placeholder="Sebep"
            allowClear
            value={reasonFilter === 'All' ? undefined : reasonFilter}
            onChange={(value) => setReasonFilter(value || 'All')}
            style={{ width: 160 }}
            options={[
              { value: 'Damaged', label: 'Hasarlı Ürün' },
              { value: 'WrongItem', label: 'Yanlış Ürün' },
              { value: 'Defective', label: 'Arızalı Ürün' },
              { value: 'PriceAdjustment', label: 'Fiyat Düzeltme' },
              { value: 'CustomerReturn', label: 'Müşteri İadesi' },
              { value: 'Other', label: 'Diğer' },
            ]}
          />
        </div>
      </Card>

      {/* Credit Notes Table */}
      {filteredNotes.length === 0 ? (
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
                {filteredNotes.map((note) => {
                  const statusConfig = getStatusConfig(note.status);
                  const reasonConfig = getReasonConfig(note.reason);
                  const ReasonIcon = reasonConfig.icon;

                  return (
                    <tr
                      key={note.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        note.status === 'Cancelled' ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <span className="font-mono font-medium text-slate-900">
                            {note.noteNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {dayjs(note.issueDate).format('DD MMM YYYY')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-indigo-600 hover:underline cursor-pointer">
                          {note.originalInvoiceNumber}
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
                                    onClick={() => handleViewDetail(note)}
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
        {selectedNote && (
          <div className="space-y-6 py-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Dekont No</div>
                <div className="font-mono font-semibold text-slate-900">{selectedNote.noteNumber}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Orijinal Fatura</div>
                <div className="font-mono text-indigo-600">{selectedNote.originalInvoiceNumber}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Müşteri</div>
                <div className="font-medium text-slate-900">{selectedNote.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tarih</div>
                <div className="text-slate-700">{dayjs(selectedNote.issueDate).format('DD MMMM YYYY')}</div>
              </div>
            </div>

            {/* Reason */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-700 uppercase tracking-wide mb-1">İade Sebebi</div>
              <div className="font-medium text-amber-900">
                {getReasonConfig(selectedNote.reason).label}
              </div>
              {selectedNote.reasonDetail && (
                <div className="text-sm text-amber-700 mt-1">{selectedNote.reasonDetail}</div>
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
                          <div className="text-xs text-slate-500 font-mono">{item.productSku}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-red-600">
                          -{formatCurrency(item.totalPrice)}
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
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">KDV (%20)</span>
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Toplam İade</span>
                <span className="font-mono text-red-600">-{formatCurrency(selectedNote.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
