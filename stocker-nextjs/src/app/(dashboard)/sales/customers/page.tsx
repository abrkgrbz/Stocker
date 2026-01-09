'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Progress,
  Modal,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

interface CustomerBalance {
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  currency: string;
  invoiceCount: number;
  overdueAmount: number;
  overdueCount: number;
  lastInvoiceDate: string | null;
}

export default function CustomerBalancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch all invoices to calculate balances
  const { data: invoicesData, isLoading, refetch } = useInvoices({ pageSize: 1000 });

  // Calculate customer balances from invoices
  const customerBalances = useMemo(() => {
    const invoices = invoicesData?.items ?? [];
    const balanceMap = new Map<string, CustomerBalance>();

    invoices.forEach((invoice: InvoiceListItem) => {
      if (invoice.status === 'Cancelled') return;

      const existing = balanceMap.get(invoice.customerName) || {
        customerName: invoice.customerName,
        totalInvoiced: 0,
        totalPaid: 0,
        balance: 0,
        currency: invoice.currency,
        invoiceCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
        lastInvoiceDate: null,
      };

      existing.totalInvoiced += invoice.grandTotal;
      existing.totalPaid += invoice.paidAmount;
      existing.balance += invoice.balanceDue;
      existing.invoiceCount += 1;

      if (invoice.status === 'Overdue') {
        existing.overdueAmount += invoice.balanceDue;
        existing.overdueCount += 1;
      }

      if (!existing.lastInvoiceDate || new Date(invoice.invoiceDate) > new Date(existing.lastInvoiceDate)) {
        existing.lastInvoiceDate = invoice.invoiceDate;
      }

      balanceMap.set(invoice.customerName, existing);
    });

    return Array.from(balanceMap.values());
  }, [invoicesData]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customerBalances;
    return customerBalances.filter(c =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customerBalances, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalCustomers: customerBalances.length,
      totalOutstanding: customerBalances.reduce((sum, c) => sum + c.balance, 0),
      totalOverdue: customerBalances.reduce((sum, c) => sum + c.overdueAmount, 0),
      customersWithBalance: customerBalances.filter(c => c.balance > 0).length,
      customersWithOverdue: customerBalances.filter(c => c.overdueCount > 0).length,
    };
  }, [customerBalances]);

  const handleViewDetail = (customer: CustomerBalance) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleViewInvoices = (customerName: string) => {
    router.push(`/sales/invoices?customer=${encodeURIComponent(customerName)}`);
  };

  const columns = [
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">{name}</span>
        </div>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: 'Toplam Fatura',
      dataIndex: 'totalInvoiced',
      key: 'totalInvoiced',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) => (
        <span className="text-slate-900">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </span>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.totalInvoiced - b.totalInvoiced,
    },
    {
      title: 'Ödenen',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) => (
        <span className="text-slate-600">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </span>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.totalPaid - b.totalPaid,
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) => (
        <span className={`font-medium ${amount > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </span>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.balance - b.balance,
    },
    {
      title: 'Vadesi Geçmiş',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) =>
        amount > 0 ? (
          <div className="flex items-center justify-end gap-1">
            <ExclamationTriangleIcon className="w-4 h-4 text-slate-700" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <CheckCircleIcon className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Yok</span>
          </div>
        ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.overdueAmount - b.overdueAmount,
    },
    {
      title: 'Fatura Sayısı',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'center' as const,
      render: (count: number) => (
        <span className="text-slate-600">{count}</span>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.invoiceCount - b.invoiceCount,
    },
    {
      title: 'Ödeme Oranı',
      key: 'paymentRate',
      align: 'center' as const,
      render: (_: unknown, record: CustomerBalance) => {
        const rate = record.totalInvoiced > 0
          ? Math.round((record.totalPaid / record.totalInvoiced) * 100)
          : 0;
        return (
          <div className="w-20">
            <Progress
              percent={rate}
              size="small"
              strokeColor={rate === 100 ? '#334155' : rate < 50 ? '#0f172a' : '#64748b'}
              trailColor="#f1f5f9"
              format={(percent) => <span className="text-xs text-slate-600">{percent}%</span>}
            />
          </div>
        );
      },
    },
    {
      title: 'Son Fatura',
      dataIndex: 'lastInvoiceDate',
      key: 'lastInvoiceDate',
      render: (date: string | null) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
        </span>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => {
        if (!a.lastInvoiceDate) return 1;
        if (!b.lastInvoiceDate) return -1;
        return new Date(a.lastInvoiceDate).getTime() - new Date(b.lastInvoiceDate).getTime();
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: CustomerBalance) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(record)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Detay"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewInvoices(record.customerName)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Faturaları Gör"
          >
            <DocumentTextIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Müşteri Bakiye Takibi</h1>
            <p className="text-sm text-slate-500">Müşterilerin borç/alacak durumunu takip edin</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Müşteri</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Alacak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalOutstanding)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Vadesi Geçmiş Alacak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalOverdue)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Borçlu Müşteri</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.customersWithBalance}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {stats.totalCustomers}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.customersWithOverdue} müşterinin vadesi geçmiş borcu var
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="customerName"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} müşteri`,
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Customer Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-slate-600" />
            <span>{selectedCustomer?.customerName}</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                if (selectedCustomer) {
                  handleViewInvoices(selectedCustomer.customerName);
                  setDetailModalOpen(false);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Faturaları Görüntüle
            </button>
            <button
              onClick={() => setDetailModalOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Kapat
            </button>
          </div>
        }
        width={600}
      >
        {selectedCustomer && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Toplam Fatura Tutarı</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.totalInvoiced)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ödenen Tutar</p>
                <p className="text-lg font-semibold text-slate-600">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.totalPaid)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Kalan Borç</p>
                <p className={`text-lg font-semibold ${selectedCustomer.balance > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.balance)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Vadesi Geçmiş</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.overdueAmount)}
                  {selectedCustomer.overdueCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                      {selectedCustomer.overdueCount} fatura
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Toplam Fatura Sayısı</p>
                <p className="text-lg font-semibold text-slate-900">{selectedCustomer.invoiceCount}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Son Fatura Tarihi</p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedCustomer.lastInvoiceDate
                    ? dayjs(selectedCustomer.lastInvoiceDate).format('DD/MM/YYYY')
                    : '-'
                  }
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Ödeme Oranı</p>
              <Progress
                percent={selectedCustomer.totalInvoiced > 0
                  ? Math.round((selectedCustomer.totalPaid / selectedCustomer.totalInvoiced) * 100)
                  : 0
                }
                strokeColor="#334155"
                trailColor="#e2e8f0"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
