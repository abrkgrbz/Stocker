'use client';

/**
 * Journal Entries (Yevmiye Fişleri) Page
 * Muhasebe kayıtları ve fiş yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Button, Select, Spin, Table, Empty, Tag, Input, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Journal entry types
const entryTypes = [
  { value: 'general', label: 'Genel Yevmiye', color: 'bg-blue-100 text-blue-700' },
  { value: 'sales', label: 'Satış Fişi', color: 'bg-green-100 text-green-700' },
  { value: 'purchase', label: 'Alış Fişi', color: 'bg-purple-100 text-purple-700' },
  { value: 'receipt', label: 'Tahsilat Fişi', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'payment', label: 'Ödeme Fişi', color: 'bg-orange-100 text-orange-700' },
  { value: 'adjustment', label: 'Düzeltme Fişi', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'closing', label: 'Kapanış Fişi', color: 'bg-red-100 text-red-700' },
];

// Status types
const statusTypes = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-600', icon: <ClockIcon className="w-3 h-3" /> },
  posted: { label: 'Muhasebeleşti', color: 'bg-green-100 text-green-700', icon: <CheckCircleIcon className="w-3 h-3" /> },
  reversed: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700', icon: <XCircleIcon className="w-3 h-3" /> },
};

interface JournalEntryDto {
  id: number;
  entryNumber: string;
  entryDate: string;
  entryType: string;
  description: string;
  status: 'draft' | 'posted' | 'reversed';
  totalDebit: number;
  totalCredit: number;
  lineCount: number;
  createdByName: string;
  createdAt: string;
  postedAt?: string;
}

// Mock data
const mockJournalEntries: JournalEntryDto[] = [
  {
    id: 1,
    entryNumber: 'YEV-2026-0001',
    entryDate: '2026-01-10',
    entryType: 'sales',
    description: 'Satış faturası - ABC Ltd.',
    status: 'posted',
    totalDebit: 11800,
    totalCredit: 11800,
    lineCount: 3,
    createdByName: 'Ahmet Yılmaz',
    createdAt: '2026-01-10T10:30:00',
    postedAt: '2026-01-10T11:00:00',
  },
  {
    id: 2,
    entryNumber: 'YEV-2026-0002',
    entryDate: '2026-01-11',
    entryType: 'purchase',
    description: 'Alış faturası - XYZ A.Ş.',
    status: 'posted',
    totalDebit: 5900,
    totalCredit: 5900,
    lineCount: 3,
    createdByName: 'Mehmet Demir',
    createdAt: '2026-01-11T14:20:00',
    postedAt: '2026-01-11T15:00:00',
  },
  {
    id: 3,
    entryNumber: 'YEV-2026-0003',
    entryDate: '2026-01-12',
    entryType: 'receipt',
    description: 'Tahsilat - ABC Ltd.',
    status: 'posted',
    totalDebit: 11800,
    totalCredit: 11800,
    lineCount: 2,
    createdByName: 'Ayşe Kaya',
    createdAt: '2026-01-12T09:15:00',
    postedAt: '2026-01-12T09:30:00',
  },
  {
    id: 4,
    entryNumber: 'YEV-2026-0004',
    entryDate: '2026-01-13',
    entryType: 'general',
    description: 'Amortisman kaydı - Ocak 2026',
    status: 'draft',
    totalDebit: 2500,
    totalCredit: 2500,
    lineCount: 2,
    createdByName: 'Fatma Özkan',
    createdAt: '2026-01-13T16:45:00',
  },
];

export default function JournalEntriesPage() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Filter entries
  const filteredEntries = mockJournalEntries.filter((entry) => {
    if (selectedType && entry.entryType !== selectedType) return false;
    if (selectedStatus && entry.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        entry.entryNumber.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Stats
  const totalEntries = mockJournalEntries.length;
  const postedEntries = mockJournalEntries.filter((e) => e.status === 'posted').length;
  const draftEntries = mockJournalEntries.filter((e) => e.status === 'draft').length;
  const totalDebit = mockJournalEntries.reduce((sum, e) => sum + e.totalDebit, 0);

  const columns: ColumnsType<JournalEntryDto> = [
    {
      title: 'Fiş No',
      key: 'entryNumber',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.entryNumber}</div>
          <div className="text-xs text-slate-500">{dayjs(record.entryDate).format('DD.MM.YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      key: 'type',
      width: 140,
      render: (_, record) => {
        const typeInfo = entryTypes.find((t) => t.value === record.entryType);
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${typeInfo?.color || 'bg-slate-100 text-slate-600'}`}>
            {typeInfo?.label || record.entryType}
          </span>
        );
      },
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className="text-sm text-slate-700">{text}</span>,
    },
    {
      title: 'Satır',
      dataIndex: 'lineCount',
      key: 'lineCount',
      width: 80,
      align: 'center',
      render: (count) => (
        <span className="text-sm text-slate-600">{count}</span>
      ),
    },
    {
      title: 'Borç Toplamı',
      dataIndex: 'totalDebit',
      key: 'totalDebit',
      align: 'right',
      width: 140,
      render: (amount) => (
        <span className="text-sm font-medium text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Alacak Toplamı',
      dataIndex: 'totalCredit',
      key: 'totalCredit',
      align: 'right',
      width: 140,
      render: (amount) => (
        <span className="text-sm font-medium text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const statusInfo = statusTypes[record.status];
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        );
      },
    },
    {
      title: 'Oluşturan',
      key: 'createdBy',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-700">{record.createdByName}</div>
          <div className="text-xs text-slate-500">{dayjs(record.createdAt).format('HH:mm')}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yevmiye Fişleri</h1>
              <p className="text-sm text-slate-500">Muhasebe kayıtları ve fiş yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                className="!bg-slate-900 hover:!bg-slate-800"
              >
                Yeni Fiş
              </Button>
              <button
                onClick={() => {}}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Toplam Fiş</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalEntries}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Muhasebeleşen</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{postedEntries}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Taslak</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{draftEntries}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Toplam Borç</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalDebit)}</div>
            </div>
          </div>

          {/* Entry Type Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {entryTypes.map((type) => {
              const count = mockJournalEntries.filter((e) => e.entryType === type.value).length;
              return (
                <div key={type.value} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <div className={`inline-block px-2 py-0.5 text-xs font-medium rounded mb-2 ${type.color}`}>
                    {type.label}
                  </div>
                  <div className="text-xl font-bold text-slate-900">{count}</div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Input
                placeholder="Fiş no veya açıklama ara..."
                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 !border-slate-300 !rounded-lg"
              />
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                options={[{ value: undefined, label: 'Tüm Türler' }, ...entryTypes]}
                className="w-40 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                placeholder="Fiş Türü"
                allowClear
              />
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { value: undefined, label: 'Tüm Durumlar' },
                  { value: 'draft', label: 'Taslak' },
                  { value: 'posted', label: 'Muhasebeleşti' },
                  { value: 'reversed', label: 'İptal Edildi' },
                ]}
                className="w-40 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                placeholder="Durum"
                allowClear
              />
              <RangePicker
                placeholder={['Başlangıç', 'Bitiş']}
                className="[&_.ant-picker-input]:!border-slate-300"
                format="DD.MM.YYYY"
              />
            </div>
          </div>

          {/* Journal Entries Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Fiş Listesi</h3>
              <div className="text-sm text-slate-500">
                {filteredEntries.length} kayıt
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">Kriterlere uygun yevmiye fişi bulunamadı</span>
                }
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredEntries}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} kayıt`,
                }}
                className={tableClassName}
              />
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Yevmiye Fişi Türleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">Genel Yevmiye</h4>
                <p className="text-xs text-slate-500">
                  Standart muhasebe kayıtları, düzeltme ve kapanış işlemleri için kullanılır.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">Satış Fişi</h4>
                <p className="text-xs text-slate-500">
                  Satış faturaları için otomatik oluşturulan yevmiye kayıtları.
                  120 Alıcılar, 600 Satışlar, 391 Hesaplanan KDV.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-700 mb-2">Alış Fişi</h4>
                <p className="text-xs text-slate-500">
                  Alış faturaları için otomatik oluşturulan kayıtlar.
                  153 Ticari Mallar, 191 İndirilecek KDV, 320 Satıcılar.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-700 mb-2">Tahsilat Fişi</h4>
                <p className="text-xs text-slate-500">
                  Müşterilerden yapılan tahsilatlar için.
                  100 Kasa veya 102 Bankalar, 120 Alıcılar.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">Ödeme Fişi</h4>
                <p className="text-xs text-slate-500">
                  Tedarikçilere yapılan ödemeler için.
                  320 Satıcılar, 100 Kasa veya 102 Bankalar.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Kapanış Fişi</h4>
                <p className="text-xs text-slate-500">
                  Dönem sonu kapanış kayıtları. Gelir-gider hesaplarının kapatılması.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">
                <span className="font-medium">Not:</span> Muhasebeleşmiş fişler değiştirilemez.
                Hatalı kayıtlar için ters kayıt (storno) yapılmalıdır.
                Taslak fişler düzenlenebilir veya silinebilir.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
