'use client';

/**
 * e-Invoice Management (e-Fatura Yönetimi) Page
 * GİB e-Fatura, e-Arşiv, e-İrsaliye yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Button, Select, Spin, Table, Empty, Tag, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useEInvoices, useEInvoiceStats } from '@/lib/api/hooks/useFinance';
import type { EInvoiceSummaryDto } from '@/lib/api/services/finance.types';
import { EInvoiceGibStatus, EInvoiceType, EInvoiceDirection } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import Link from 'next/link';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// e-Invoice type labels
const eInvoiceTypeLabels: Record<EInvoiceType, { label: string; color: string }> = {
  [EInvoiceType.EFatura]: { label: 'e-Fatura', color: 'bg-blue-100 text-blue-700' },
  [EInvoiceType.EArsiv]: { label: 'e-Arşiv', color: 'bg-green-100 text-green-700' },
  [EInvoiceType.EIrsaliye]: { label: 'e-İrsaliye', color: 'bg-purple-100 text-purple-700' },
  [EInvoiceType.EMustahsil]: { label: 'e-Müstahsil', color: 'bg-orange-100 text-orange-700' },
  [EInvoiceType.ESerbest]: { label: 'e-SMM', color: 'bg-pink-100 text-pink-700' },
};

// GİB status labels
const gibStatusLabels: Record<EInvoiceGibStatus, { label: string; icon: React.ReactNode; color: string }> = {
  [EInvoiceGibStatus.Draft]: { label: 'Taslak', icon: <ClockIcon className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600' },
  [EInvoiceGibStatus.WaitingForSend]: { label: 'Gönderim Bekliyor', icon: <ClockIcon className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
  [EInvoiceGibStatus.Sent]: { label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  [EInvoiceGibStatus.Delivered]: { label: 'Teslim Edildi', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700' },
  [EInvoiceGibStatus.Accepted]: { label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  [EInvoiceGibStatus.Rejected]: { label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
  [EInvoiceGibStatus.Cancelled]: { label: 'İptal Edildi', icon: <XCircleIcon className="w-4 h-4" />, color: 'bg-slate-100 text-slate-500' },
  [EInvoiceGibStatus.Archived]: { label: 'Arşivlendi', icon: <DocumentDuplicateIcon className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600' },
  [EInvoiceGibStatus.Error]: { label: 'Hata', icon: <ExclamationTriangleIcon className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
};

export default function EInvoicePage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDirection, setSelectedDirection] = useState<EInvoiceDirection | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<EInvoiceType | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<EInvoiceGibStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch e-Invoices
  const { data: eInvoices, isLoading, refetch } = useEInvoices({
    direction: selectedDirection,
    eInvoiceType: selectedType,
    gibStatus: selectedStatus,
    searchTerm: searchTerm || undefined,
  });

  // Fetch stats
  const { data: stats } = useEInvoiceStats(selectedYear, selectedMonth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  // Generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  // Direction options
  const directionOptions = [
    { value: undefined, label: 'Tümü' },
    { value: EInvoiceDirection.Outgoing, label: 'Giden' },
    { value: EInvoiceDirection.Incoming, label: 'Gelen' },
  ];

  // Type options
  const typeOptions = [
    { value: undefined, label: 'Tüm Türler' },
    ...Object.entries(eInvoiceTypeLabels).map(([key, value]) => ({
      value: key as EInvoiceType,
      label: value.label,
    })),
  ];

  // Status options
  const statusOptions = [
    { value: undefined, label: 'Tüm Durumlar' },
    ...Object.entries(gibStatusLabels).map(([key, value]) => ({
      value: key as EInvoiceGibStatus,
      label: value.label,
    })),
  ];

  const items = eInvoices?.items || [];

  const columns: ColumnsType<EInvoiceSummaryDto> = [
    {
      title: 'Fatura',
      key: 'invoice',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.invoiceNumber}</div>
          <div className="text-xs text-slate-500 font-mono">{record.uuid.substring(0, 8)}...</div>
        </div>
      ),
    },
    {
      title: 'Yön',
      key: 'direction',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.direction === EInvoiceDirection.Outgoing ? (
            <ArrowUpTrayIcon className="w-4 h-4 text-blue-600" />
          ) : (
            <ArrowDownTrayIcon className="w-4 h-4 text-green-600" />
          )}
          <span className="text-xs text-slate-600">
            {record.direction === EInvoiceDirection.Outgoing ? 'Giden' : 'Gelen'}
          </span>
        </div>
      ),
    },
    {
      title: 'Tür',
      key: 'type',
      width: 120,
      render: (_, record) => {
        const typeInfo = eInvoiceTypeLabels[record.eInvoiceType];
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        );
      },
    },
    {
      title: 'Taraf',
      key: 'party',
      render: (_, record) => (
        <div className="text-sm text-slate-700">
          {record.direction === EInvoiceDirection.Outgoing
            ? record.receiverTitle
            : record.senderTitle}
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'date',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (amount, record) => (
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'GİB Durumu',
      key: 'status',
      width: 160,
      render: (_, record) => {
        const statusInfo = gibStatusLabels[record.gibStatus];
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <DocumentDuplicateIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">e-Fatura Yönetimi</h1>
              <p className="text-sm text-slate-500">GİB e-Fatura, e-Arşiv ve e-İrsaliye işlemleri</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/finance/e-invoice/settings">
                <Button
                  icon={<Cog6ToothIcon className="w-4 h-4" />}
                  className="!border-slate-300 !text-slate-600 hover:!bg-slate-100"
                >
                  GİB Ayarları
                </Button>
              </Link>
              <button
                onClick={() => refetch()}
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DocumentDuplicateIcon className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Toplam</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats?.totalCount || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpTrayIcon className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Giden</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats?.outgoingCount || 0}</div>
              <div className="text-xs text-slate-500">{formatCurrency(stats?.outgoingTotal || 0)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownTrayIcon className="w-5 h-5 text-green-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Gelen</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.incomingCount || 0}</div>
              <div className="text-xs text-slate-500">{formatCurrency(stats?.incomingTotal || 0)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Kabul</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.acceptedCount || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Bekleyen</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats?.sentCount || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Hata</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats?.errorCount || 0}</div>
            </div>
          </div>

          {/* Type Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm font-medium text-blue-900">e-Fatura (B2B)</div>
              <div className="text-2xl font-bold text-blue-700">{stats?.eFaturaCount || 0}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm font-medium text-green-900">e-Arşiv (B2C)</div>
              <div className="text-2xl font-bold text-green-700">{stats?.eArsivCount || 0}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="text-sm font-medium text-purple-900">e-İrsaliye</div>
              <div className="text-2xl font-bold text-purple-700">{stats?.eIrsaliyeCount || 0}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={yearOptions}
                className="w-24 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <Select
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                options={monthOptions}
                className="w-32 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <Select
                value={selectedDirection}
                onChange={(value) => setSelectedDirection(value)}
                options={directionOptions}
                className="w-28 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                placeholder="Yön"
              />
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                options={typeOptions}
                className="w-36 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                placeholder="Tür"
              />
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={statusOptions}
                className="w-40 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                placeholder="Durum"
              />
              <Input
                placeholder="Fatura no veya taraf ara..."
                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 !border-slate-300 !rounded-lg"
              />
            </div>
          </div>

          {/* e-Invoice Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">e-Fatura Listesi</h3>
              <div className="text-sm text-slate-500">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </div>
            </div>

            {items.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">Bu dönemde e-fatura kaydı bulunmuyor</span>
                }
              />
            ) : (
              <Table
                columns={columns}
                dataSource={items}
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
            <h3 className="text-sm font-semibold text-slate-900 mb-4">e-Fatura Türleri Rehberi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">e-Fatura (B2B)</h4>
                <p className="text-xs text-slate-500">
                  Mükellefler arası (B2B) elektronik fatura. GİB mükellef listesinde kayıtlı
                  şirketlere düzenlenen faturalar.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">e-Arşiv (B2C)</h4>
                <p className="text-xs text-slate-500">
                  e-Fatura mükellefiyeti olmayan kişi ve kurumlara düzenlenen elektronik
                  arşiv faturalar.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-700 mb-2">e-İrsaliye</h4>
                <p className="text-xs text-slate-500">
                  Mal sevkiyatı için düzenlenen elektronik irsaliye belgesi. GİB sistemine
                  entegre sevk irsaliyesi.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">
                <span className="font-medium">Not:</span> e-Fatura işlemleri için GİB entegrasyonunun
                aktif olması gerekmektedir. GİB Ayarları sayfasından entegrasyon yapılandırmasını
                gerçekleştirebilirsiniz.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
