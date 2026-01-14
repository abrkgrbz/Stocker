'use client';

/**
 * Sales Invoices Page (Satış Faturaları)
 * Filtered view showing only sales invoices
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Input, DatePicker, Spin, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowUpOnSquareIcon,
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
interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerCode: string;
  subtotal: number;
  vatAmount: number;
  withholdingAmount: number;
  totalAmount: number;
  status: 'draft' | 'approved' | 'sent' | 'paid' | 'partial' | 'cancelled';
  eInvoiceStatus: 'not_sent' | 'pending' | 'sent' | 'accepted' | 'rejected' | null;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

// Status configurations
const invoiceStatusConfig = {
  draft: { label: 'Taslak', color: 'default' },
  approved: { label: 'Onaylandı', color: 'blue' },
  sent: { label: 'Gönderildi', color: 'cyan' },
  paid: { label: 'Ödendi', color: 'green' },
  partial: { label: 'Kısmi Ödeme', color: 'orange' },
  cancelled: { label: 'İptal', color: 'red' },
};

const eInvoiceStatusConfig = {
  not_sent: { label: 'Gönderilmedi', color: 'default' },
  pending: { label: 'Bekliyor', color: 'processing' },
  sent: { label: 'Gönderildi', color: 'blue' },
  accepted: { label: 'Kabul', color: 'success' },
  rejected: { label: 'Reddedildi', color: 'error' },
};

// Mock data
const mockInvoices: SalesInvoice[] = [
  {
    id: 1,
    invoiceNumber: 'SLS-2025-001245',
    invoiceDate: '2025-01-10',
    dueDate: '2025-02-10',
    customerName: 'ABC Ticaret Ltd. Şti.',
    customerCode: 'MUS-001',
    subtotal: 85000,
    vatAmount: 15300,
    withholdingAmount: 0,
    totalAmount: 100300,
    status: 'sent',
    eInvoiceStatus: 'accepted',
    paymentStatus: 'unpaid',
  },
  {
    id: 2,
    invoiceNumber: 'SLS-2025-001244',
    invoiceDate: '2025-01-09',
    dueDate: '2025-02-09',
    customerName: 'XYZ Holding A.Ş.',
    customerCode: 'MUS-002',
    subtotal: 250000,
    vatAmount: 45000,
    withholdingAmount: 22500,
    totalAmount: 272500,
    status: 'approved',
    eInvoiceStatus: 'pending',
    paymentStatus: 'partial',
  },
  {
    id: 3,
    invoiceNumber: 'SLS-2025-001243',
    invoiceDate: '2025-01-08',
    dueDate: '2025-01-23',
    customerName: 'Mega Yapı İnşaat',
    customerCode: 'MUS-003',
    subtotal: 175000,
    vatAmount: 31500,
    withholdingAmount: 15750,
    totalAmount: 190750,
    status: 'paid',
    eInvoiceStatus: 'accepted',
    paymentStatus: 'paid',
  },
  {
    id: 4,
    invoiceNumber: 'SLS-2025-001242',
    invoiceDate: '2025-01-07',
    dueDate: '2025-02-07',
    customerName: 'Deniz Lojistik',
    customerCode: 'MUS-004',
    subtotal: 42000,
    vatAmount: 7560,
    withholdingAmount: 0,
    totalAmount: 49560,
    status: 'draft',
    eInvoiceStatus: null,
    paymentStatus: 'unpaid',
  },
  {
    id: 5,
    invoiceNumber: 'SLS-2025-001241',
    invoiceDate: '2025-01-06',
    dueDate: '2025-01-21',
    customerName: 'Star Elektronik',
    customerCode: 'MUS-005',
    subtotal: 68000,
    vatAmount: 12240,
    withholdingAmount: 0,
    totalAmount: 80240,
    status: 'cancelled',
    eInvoiceStatus: 'rejected',
    paymentStatus: 'unpaid',
  },
];

export default function SalesInvoicesPage() {
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

  const columns: ColumnsType<SalesInvoice> = [
    {
      title: 'Fatura No',
      key: 'invoice',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <Link href={`/finance/invoices/${record.id}`} className="group">
          <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600">{record.invoiceNumber}</div>
          <div className="text-xs text-slate-500">{dayjs(record.invoiceDate).format('DD MMM YYYY')}</div>
        </Link>
      ),
    },
    {
      title: 'Müşteri',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.customerName}</div>
          <div className="text-xs text-slate-500">{record.customerCode}</div>
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
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
          <ArrowUpOnSquareIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Satış Faturaları</h1>
              <p className="text-sm text-slate-500">Müşterilere kesilen satış faturaları</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/finance/invoices/new?type=sales"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Satış Faturası</span>
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
          <div className="text-xs text-slate-500 mt-1">brüt satış</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">KDV Tutarı</div>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(totals.vat)}</div>
          <div className="text-xs text-slate-500 mt-1">hesaplanan KDV</div>
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
            placeholder="Fatura no veya müşteri ara..."
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
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Satış Faturaları Listesi</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockInvoices.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">Satış faturası bulunmuyor</span>}
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
    </div>
  );
}
