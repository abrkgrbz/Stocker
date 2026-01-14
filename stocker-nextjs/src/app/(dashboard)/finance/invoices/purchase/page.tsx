'use client';

/**
 * Purchase Invoices Page (Alış Faturaları)
 * Filtered view showing only purchase invoices
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Input, DatePicker, Spin, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowDownOnSquareIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  vendorName: string;
  vendorCode: string;
  subtotal: number;
  vatAmount: number;
  withholdingAmount: number;
  totalAmount: number;
  status: 'draft' | 'approved' | 'received' | 'paid' | 'partial' | 'cancelled';
  eInvoiceStatus: 'not_received' | 'pending' | 'received' | 'accepted' | 'rejected' | null;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

// Status configurations
const invoiceStatusConfig = {
  draft: { label: 'Taslak', color: 'default' },
  approved: { label: 'Onaylandı', color: 'blue' },
  received: { label: 'Alındı', color: 'cyan' },
  paid: { label: 'Ödendi', color: 'green' },
  partial: { label: 'Kısmi Ödeme', color: 'orange' },
  cancelled: { label: 'İptal', color: 'red' },
};

const eInvoiceStatusConfig = {
  not_received: { label: 'Alınmadı', color: 'default' },
  pending: { label: 'Bekliyor', color: 'processing' },
  received: { label: 'Alındı', color: 'blue' },
  accepted: { label: 'Kabul Edildi', color: 'success' },
  rejected: { label: 'Reddedildi', color: 'error' },
};

// Mock data
const mockInvoices: PurchaseInvoice[] = [
  {
    id: 1,
    invoiceNumber: 'PUR-2025-000892',
    vendorInvoiceNumber: 'FTR-2025-4521',
    invoiceDate: '2025-01-10',
    dueDate: '2025-02-10',
    vendorName: 'Global Tedarik A.Ş.',
    vendorCode: 'TED-001',
    subtotal: 125000,
    vatAmount: 22500,
    withholdingAmount: 0,
    totalAmount: 147500,
    status: 'received',
    eInvoiceStatus: 'accepted',
    paymentStatus: 'unpaid',
  },
  {
    id: 2,
    invoiceNumber: 'PUR-2025-000891',
    vendorInvoiceNumber: 'INV-45892',
    invoiceDate: '2025-01-09',
    dueDate: '2025-02-09',
    vendorName: 'Merkez Dağıtım Ltd.',
    vendorCode: 'TED-002',
    subtotal: 85000,
    vatAmount: 15300,
    withholdingAmount: 7650,
    totalAmount: 92650,
    status: 'approved',
    eInvoiceStatus: 'received',
    paymentStatus: 'partial',
  },
  {
    id: 3,
    invoiceNumber: 'PUR-2025-000890',
    vendorInvoiceNumber: 'EMK-2025-1234',
    invoiceDate: '2025-01-08',
    dueDate: '2025-01-23',
    vendorName: 'Endüstri Makina',
    vendorCode: 'TED-003',
    subtotal: 320000,
    vatAmount: 57600,
    withholdingAmount: 28800,
    totalAmount: 348800,
    status: 'paid',
    eInvoiceStatus: 'accepted',
    paymentStatus: 'paid',
  },
  {
    id: 4,
    invoiceNumber: 'PUR-2025-000889',
    vendorInvoiceNumber: 'TKN-8756',
    invoiceDate: '2025-01-07',
    dueDate: '2025-02-07',
    vendorName: 'Teknoloji Sistemleri',
    vendorCode: 'TED-004',
    subtotal: 55000,
    vatAmount: 9900,
    withholdingAmount: 0,
    totalAmount: 64900,
    status: 'draft',
    eInvoiceStatus: null,
    paymentStatus: 'unpaid',
  },
  {
    id: 5,
    invoiceNumber: 'PUR-2025-000888',
    vendorInvoiceNumber: 'KMY-2025-0045',
    invoiceDate: '2025-01-06',
    dueDate: '2025-01-21',
    vendorName: 'Kimya Sanayi',
    vendorCode: 'TED-005',
    subtotal: 42000,
    vatAmount: 7560,
    withholdingAmount: 3780,
    totalAmount: 45780,
    status: 'cancelled',
    eInvoiceStatus: 'rejected',
    paymentStatus: 'unpaid',
  },
];

export default function PurchaseInvoicesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Calculate totals
  const totals = mockInvoices.reduce(
    (acc, inv) => {
      if (inv.status !== 'cancelled') {
        acc.subtotal += inv.subtotal;
        acc.vat += inv.vatAmount;
        acc.withholding += inv.withholdingAmount;
        acc.total += inv.totalAmount;
        acc.count += 1;
      }
      return acc;
    },
    { subtotal: 0, vat: 0, withholding: 0, total: 0, count: 0 }
  );

  const columns: ColumnsType<PurchaseInvoice> = [
    {
      title: 'Fatura No',
      key: 'invoice',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <Link href={`/finance/invoices/${record.id}`} className="group">
          <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600">{record.invoiceNumber}</div>
          <div className="text-xs text-slate-500">{record.vendorInvoiceNumber}</div>
        </Link>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 100,
      render: (date) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Tedarikçi',
      key: 'vendor',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.vendorName}</div>
          <div className="text-xs text-slate-500">{record.vendorCode}</div>
        </div>
      ),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 100,
      render: (date) => {
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Tutar',
      key: 'amounts',
      align: 'right',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{formatCurrency(record.totalAmount)}</div>
          <div className="text-xs text-slate-500">KDV: {formatCurrency(record.vatAmount)}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const config = invoiceStatusConfig[record.status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'e-Fatura',
      key: 'eInvoice',
      width: 100,
      render: (_, record) => {
        if (!record.eInvoiceStatus) return <span className="text-xs text-slate-400">-</span>;
        const config = eInvoiceStatusConfig[record.eInvoiceStatus];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/finance/invoices/${record.id}`}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <EyeIcon className="w-4 h-4 text-slate-500" />
          </Link>
          <Link
            href={`/finance/invoices/${record.id}/edit`}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
          <ArrowDownOnSquareIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Alış Faturaları</h1>
              <p className="text-sm text-slate-500">Tedarikçilerden alınan satın alma faturaları</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/finance/invoices/new?type=purchase"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Alış Faturası</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam Fatura</div>
          <div className="text-2xl font-bold text-slate-900">{totals.count}</div>
          <div className="text-xs text-slate-500 mt-1">aktif fatura</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam Tutar</div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totals.total)}</div>
          <div className="text-xs text-slate-500 mt-1">brüt alış</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">İndirilecek KDV</div>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(totals.vat)}</div>
          <div className="text-xs text-slate-500 mt-1">KDV indirimi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tevkifat</div>
          <div className="text-xl font-bold text-purple-600">{formatCurrency(totals.withholding)}</div>
          <div className="text-xs text-slate-500 mt-1">kesilen tevkifat</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Filtreler:</span>
          </div>
          <Input
            placeholder="Fatura no veya tedarikçi ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="Durum"
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={Object.entries(invoiceStatusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            className="w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Alış Faturaları Listesi</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockInvoices.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">Alış faturası bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={mockInvoices}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} fatura`,
            }}
            scroll={{ x: 1200 }}
            className={tableClassName}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-orange-900 mb-3">Alış Faturaları Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-orange-700">
          <div>
            <h4 className="font-medium text-orange-800 mb-1">e-Fatura Alımı</h4>
            <p>
              GİB&apos;e kayıtlı tedarikçilerden gelen e-Faturalar otomatik olarak sisteme aktarılır.
              Gelen faturalar onay sürecinden geçtikten sonra muhasebe entegrasyonu yapılır.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-orange-800 mb-1">Tevkifat Uygulaması</h4>
            <p>
              Alış faturalarında uygulanan tevkifat tutarları, sorumlu sıfatıyla KDV2 beyannamesi
              ile beyan edilir. Sistem otomatik olarak tevkifat hesabını oluşturur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
