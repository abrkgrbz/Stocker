'use client';

/**
 * Current Account Transactions (Cari Hareketler) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Select, Spin, DatePicker, Empty, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  XCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
  DocumentMinusIcon,
  DocumentPlusIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useCurrentAccounts, useCurrentAccountTransactions } from '@/lib/api/hooks/useFinance';
import type { CurrentAccountTransactionDto, CurrentAccountTransactionType } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Transaction type configuration
const transactionTypeConfig: Record<CurrentAccountTransactionType, { label: string; icon: React.ReactNode; color: string }> = {
  Invoice: { label: 'Fatura', icon: <DocumentTextIcon className="w-4 h-4" />, color: 'slate' },
  Payment: { label: 'Ödeme', icon: <BanknotesIcon className="w-4 h-4" />, color: 'green' },
  CreditNote: { label: 'Alacak Dekontu', icon: <ReceiptRefundIcon className="w-4 h-4" />, color: 'blue' },
  DebitNote: { label: 'Borç Dekontu', icon: <DocumentMinusIcon className="w-4 h-4" />, color: 'red' },
  OpeningBalance: { label: 'Açılış Bakiyesi', icon: <DocumentPlusIcon className="w-4 h-4" />, color: 'purple' },
  Adjustment: { label: 'Düzeltme', icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />, color: 'amber' },
};

export default function CurrentAccountTransactionsPage() {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Fetch current accounts for dropdown
  const { data: accountsData, isLoading: accountsLoading } = useCurrentAccounts({ pageSize: 500 });
  const accounts = accountsData?.items || [];

  // Fetch transactions for selected account
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error,
    refetch
  } = useCurrentAccountTransactions(
    selectedAccountId || 0,
    dateRange?.[0]?.toISOString(),
    dateRange?.[1]?.toISOString()
  );

  // Calculate stats from transactions
  const stats = {
    totalTransactions: transactions.length,
    totalDebit: transactions.reduce((sum, t) => sum + t.debitAmount, 0),
    totalCredit: transactions.reduce((sum, t) => sum + t.creditAmount, 0),
    balance: transactions.length > 0 ? transactions[transactions.length - 1]?.balance || 0 : 0,
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleViewDocument = (transaction: CurrentAccountTransactionDto) => {
    if (transaction.documentId && transaction.transactionType === 'Invoice') {
      router.push(`/finance/invoices/${transaction.documentId}`);
    }
  };

  const columns: ColumnsType<CurrentAccountTransactionDto> = [
    {
      title: 'Tarih',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'İşlem Türü',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 160,
      render: (type: CurrentAccountTransactionType) => {
        const config = transactionTypeConfig[type] || { label: type, icon: null, color: 'slate' };
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-${config.color}-100 flex items-center justify-center text-${config.color}-600`}>
              {config.icon}
            </div>
            <span className="text-sm font-medium text-slate-900">{config.label}</span>
          </div>
        );
      },
    },
    {
      title: 'Belge No',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      render: (text, record) => (
        <span
          className={`text-sm ${record.documentId ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-600'}`}
          onClick={() => record.documentId && handleViewDocument(record)}
        >
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Borç',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'right',
      width: 140,
      render: (amount, record) => (
        <span className={`text-sm font-medium ${amount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
          {amount > 0 ? formatCurrency(amount, record.currency) : '-'}
        </span>
      ),
    },
    {
      title: 'Alacak',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'right',
      width: 140,
      render: (amount, record) => (
        <span className={`text-sm font-medium ${amount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
          {amount > 0 ? formatCurrency(amount, record.currency) : '-'}
        </span>
      ),
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      width: 140,
      render: (balance, record) => (
        <span className={`text-sm font-semibold ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
          {formatCurrency(balance, record.currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Cari Hareketler</h1>
              <p className="text-sm text-slate-500">Cari hesap hareketlerini görüntüleyin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={() => refetch()}
                loading={transactionsLoading}
                disabled={!selectedAccountId}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Yenile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Selection */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Cari Hesap Seçin</label>
            <Select
              value={selectedAccountId || undefined}
              onChange={(value) => setSelectedAccountId(value)}
              options={accounts.map((acc) => ({
                value: acc.id,
                label: `${acc.accountCode} - ${acc.accountName}`,
              }))}
              placeholder="Cari hesap seçin..."
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              size="large"
              loading={accountsLoading}
              className="w-full [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tarih Aralığı</label>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
              size="large"
              disabled={!selectedAccountId}
              className="w-full [&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards - Only show when account is selected */}
      {selectedAccountId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Hareket</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <ArrowUpIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDebit)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Borç</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ArrowDownIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCredit)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Alacak</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Güncel Bakiye</div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && selectedAccountId && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Cari hareketler yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Veriler getirilirken bir hata oluştu.'}
              </p>
            </div>
            <Button
              size="small"
              onClick={() => refetch()}
              className="!border-slate-300 !text-slate-600"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Table / Empty State */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {!selectedAccountId ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-slate-500">
                Hareketleri görüntülemek için bir cari hesap seçin
              </span>
            }
          />
        ) : transactionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            loading={transactionsLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} hareket`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            className={tableClassName}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bu cari hesaba ait hareket bulunamadı"
                />
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}
