'use client';

/**
 * Payment Plans Page (Ödeme Planları)
 * Taksitli ödeme ve tahsilat planları yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Input, Spin, Empty, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
interface PaymentPlan {
  id: number;
  planNumber: string;
  type: 'receivable' | 'payable';
  accountName: string;
  accountCode: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installmentCount: number;
  paidInstallments: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
}

// Status configurations
const statusConfig = {
  active: { label: 'Aktif', color: 'blue' },
  completed: { label: 'Tamamlandı', color: 'green' },
  overdue: { label: 'Gecikmiş', color: 'red' },
  cancelled: { label: 'İptal', color: 'default' },
};

// Mock data
const mockPlans: PaymentPlan[] = [
  {
    id: 1,
    planNumber: 'PLN-2025-001234',
    type: 'receivable',
    accountName: 'ABC Ticaret Ltd. Şti.',
    accountCode: 'MUS-001',
    invoiceNumber: 'SLS-2025-001245',
    totalAmount: 150000,
    paidAmount: 50000,
    remainingAmount: 100000,
    installmentCount: 6,
    paidInstallments: 2,
    startDate: '2025-01-01',
    endDate: '2025-06-01',
    nextPaymentDate: '2025-02-01',
    nextPaymentAmount: 25000,
    status: 'active',
  },
  {
    id: 2,
    planNumber: 'PLN-2025-001233',
    type: 'payable',
    accountName: 'Global Tedarik A.Ş.',
    accountCode: 'TED-001',
    invoiceNumber: 'PUR-2025-000892',
    totalAmount: 200000,
    paidAmount: 100000,
    remainingAmount: 100000,
    installmentCount: 4,
    paidInstallments: 2,
    startDate: '2024-12-01',
    endDate: '2025-03-01',
    nextPaymentDate: '2025-02-01',
    nextPaymentAmount: 50000,
    status: 'active',
  },
  {
    id: 3,
    planNumber: 'PLN-2025-001232',
    type: 'receivable',
    accountName: 'XYZ Holding A.Ş.',
    accountCode: 'MUS-002',
    invoiceNumber: 'SLS-2025-001240',
    totalAmount: 300000,
    paidAmount: 300000,
    remainingAmount: 0,
    installmentCount: 3,
    paidInstallments: 3,
    startDate: '2024-11-01',
    endDate: '2025-01-01',
    nextPaymentDate: '',
    nextPaymentAmount: 0,
    status: 'completed',
  },
  {
    id: 4,
    planNumber: 'PLN-2025-001231',
    type: 'payable',
    accountName: 'Merkez Dağıtım Ltd.',
    accountCode: 'TED-002',
    invoiceNumber: 'PUR-2025-000880',
    totalAmount: 85000,
    paidAmount: 17000,
    remainingAmount: 68000,
    installmentCount: 5,
    paidInstallments: 1,
    startDate: '2024-12-15',
    endDate: '2025-04-15',
    nextPaymentDate: '2025-01-15',
    nextPaymentAmount: 17000,
    status: 'overdue',
  },
];

export default function PaymentPlansPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Calculate totals
  const totals = mockPlans.reduce(
    (acc, plan) => {
      if (plan.type === 'receivable') {
        acc.receivableTotal += plan.totalAmount;
        acc.receivablePaid += plan.paidAmount;
        acc.receivableRemaining += plan.remainingAmount;
      } else {
        acc.payableTotal += plan.totalAmount;
        acc.payablePaid += plan.paidAmount;
        acc.payableRemaining += plan.remainingAmount;
      }
      return acc;
    },
    { receivableTotal: 0, receivablePaid: 0, receivableRemaining: 0, payableTotal: 0, payablePaid: 0, payableRemaining: 0 }
  );

  const columns: ColumnsType<PaymentPlan> = [
    {
      title: 'Plan',
      key: 'plan',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.planNumber}</div>
          <div className="text-xs text-slate-500">{record.invoiceNumber}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      key: 'type',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.type === 'receivable' ? (
            <>
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600">Alacak</span>
            </>
          ) : (
            <>
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">Borç</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Hesap',
      key: 'account',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.accountName}</div>
          <div className="text-xs text-slate-500">{record.accountCode}</div>
        </div>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 180,
      render: (_, record) => {
        const percentage = (record.paidAmount / record.totalAmount) * 100;
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{record.paidInstallments}/{record.installmentCount} taksit</span>
              <span className="font-medium text-slate-700">{percentage.toFixed(0)}%</span>
            </div>
            <Progress
              percent={percentage}
              size="small"
              showInfo={false}
              strokeColor={record.status === 'completed' ? '#10b981' : '#3b82f6'}
            />
          </div>
        );
      },
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-emerald-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Sonraki Ödeme',
      key: 'nextPayment',
      width: 140,
      render: (_, record) => {
        if (!record.nextPaymentDate) {
          return <span className="text-xs text-slate-400">-</span>;
        }
        const isOverdue = dayjs(record.nextPaymentDate).isBefore(dayjs(), 'day');
        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
              {formatCurrency(record.nextPaymentAmount)}
            </div>
            <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
              {dayjs(record.nextPaymentDate).format('DD.MM.YYYY')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Link
          href={`/finance/payment-plans/${record.id}`}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
        >
          <EyeIcon className="w-4 h-4 text-slate-500" />
        </Link>
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
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalendarDaysIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ödeme Planları</h1>
              <p className="text-sm text-slate-500">Taksitli ödeme ve tahsilat planları yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/finance/payment-plans/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Plan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-500">Alacak Planları</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">{formatCurrency(totals.receivableRemaining)}</div>
          <div className="text-xs text-slate-500 mt-1">kalan tahsilat</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
            <span className="text-xs text-slate-500">Borç Planları</span>
          </div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(totals.payableRemaining)}</div>
          <div className="text-xs text-slate-500 mt-1">kalan ödeme</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-2">Toplam Tahsil Edilen</div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totals.receivablePaid)}</div>
          <div className="text-xs text-emerald-600 mt-1">alacaklardan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-2">Toplam Ödenen</div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totals.payablePaid)}</div>
          <div className="text-xs text-red-600 mt-1">borçlara</div>
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
            placeholder="Plan no veya cari hesap ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="Tür"
            allowClear
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            className="w-32"
            options={[
              { value: 'receivable', label: 'Alacak' },
              { value: 'payable', label: 'Borç' },
            ]}
          />
          <Select
            placeholder="Durum"
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <BanknotesIcon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Ödeme Planları Listesi</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockPlans.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">Ödeme planı bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={mockPlans}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} plan`,
            }}
            scroll={{ x: 1300 }}
            className={tableClassName}
          />
        )}
      </div>
    </div>
  );
}
