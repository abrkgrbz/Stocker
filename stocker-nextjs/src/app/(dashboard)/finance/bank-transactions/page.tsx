'use client';

/**
 * Bank Transactions (Banka Hareketleri) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  XCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { useBankTransactions, useBankAccounts, useReconcileBankTransaction } from '@/lib/api/hooks/useFinance';
import type { BankTransactionDto, BankTransactionFilterDto, TransactionType } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Transaction type configuration
const transactionTypeConfig: Record<string, { label: string; icon: 'in' | 'out' | 'neutral' }> = {
  Deposit: { label: 'Yatırma', icon: 'in' },
  Withdrawal: { label: 'Çekme', icon: 'out' },
  Transfer: { label: 'Transfer', icon: 'neutral' },
  Fee: { label: 'Masraf', icon: 'out' },
  Interest: { label: 'Faiz', icon: 'in' },
  Cheque: { label: 'Çek', icon: 'neutral' },
  DirectDebit: { label: 'Otomatik Ödeme', icon: 'out' },
  Standing: { label: 'Düzenli Ödeme', icon: 'out' },
};

export default function BankTransactionsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [bankAccountId, setBankAccountId] = useState<number | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>(undefined);
  const [isReconciled, setIsReconciled] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Fetch bank accounts for filter
  const { data: bankAccountsData } = useBankAccounts({ pageSize: 100 });
  const bankAccounts = bankAccountsData?.items || [];

  const reconcileMutation = useReconcileBankTransaction();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: BankTransactionFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    bankAccountId,
    transactionType,
    isReconciled,
    startDate: dateRange?.[0]?.toISOString(),
    endDate: dateRange?.[1]?.toISOString(),
  };

  // Fetch transactions from API
  const { data, isLoading, error, refetch } = useBankTransactions(filters);

  const transactions = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    deposits: transactions.filter((t) => t.transactionType === 'Deposit').reduce((sum, t) => sum + t.amount, 0),
    withdrawals: transactions.filter((t) => t.transactionType === 'Withdrawal').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    unreconciled: transactions.filter((t) => !t.isReconciled).length,
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleReconcile = async (transactionId: number) => {
    try {
      await reconcileMutation.mutateAsync(transactionId);
      showSuccess('İşlem mutabakat edildi!');
    } catch (err) {
      showApiError(err, 'Mutabakat işlemi başarısız oldu');
    }
  };

  const handleReconcileClick = (transaction: BankTransactionDto) => {
    if (transaction.isReconciled) return;

    Modal.confirm({
      title: 'Mutabakat Onayla',
      content: `${transaction.referenceNumber || transaction.id} numaralı işlem mutabakat edilecek. Onaylıyor musunuz?`,
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        await handleReconcile(transaction.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/bank-transactions/new');
  };

  const handleView = (transactionId: number) => {
    router.push(`/finance/bank-transactions/${transactionId}`);
  };

  const transactionTypeOptions = [
    { value: '', label: 'Tüm Türler' },
    { value: 'Deposit', label: 'Yatırma' },
    { value: 'Withdrawal', label: 'Çekme' },
    { value: 'Transfer', label: 'Transfer' },
    { value: 'Fee', label: 'Masraf' },
    { value: 'Interest', label: 'Faiz' },
    { value: 'Cheque', label: 'Çek' },
    { value: 'DirectDebit', label: 'Otomatik Ödeme' },
    { value: 'Standing', label: 'Düzenli Ödeme' },
  ];

  const reconciledOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'true', label: 'Mutabık' },
    { value: 'false', label: 'Beklemede' },
  ];

  const columns: ColumnsType<BankTransactionDto> = [
    {
      title: 'İşlem',
      key: 'transaction',
      render: (_, record) => {
        const config = transactionTypeConfig[record.transactionType] || { label: record.transactionType, icon: 'neutral' };
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              config.icon === 'in' ? 'bg-green-100' : config.icon === 'out' ? 'bg-red-100' : 'bg-slate-100'
            }`}>
              {config.icon === 'in' ? (
                <ArrowDownIcon className="w-5 h-5 text-green-600" />
              ) : config.icon === 'out' ? (
                <ArrowUpIcon className="w-5 h-5 text-red-600" />
              ) : (
                <BanknotesIcon className="w-5 h-5 text-slate-600" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{config.label}</div>
              <div className="text-xs text-slate-500">{record.referenceNumber || '-'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Banka Hesabı',
      dataIndex: 'bankAccountName',
      key: 'bankAccountName',
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Karşı Taraf',
      key: 'counterparty',
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.counterpartyName || record.currentAccountName || '-'}</div>
          {record.counterpartyIban && (
            <div className="text-xs text-slate-500">{record.counterpartyIban}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        const config = transactionTypeConfig[record.transactionType] || { icon: 'neutral' };
        const isPositive = config.icon === 'in';
        return (
          <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : config.icon === 'out' ? 'text-red-600' : 'text-slate-900'}`}>
            {isPositive ? '+' : config.icon === 'out' ? '-' : ''}{formatCurrency(Math.abs(amount), record.currency)}
          </div>
        );
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Mutabakat',
      dataIndex: 'isReconciled',
      key: 'isReconciled',
      render: (isReconciled) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
          isReconciled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isReconciled ? 'Mutabık' : 'Beklemede'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              ...(!record.isReconciled ? [{
                key: 'reconcile',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Mutabakat Yap',
                onClick: () => handleReconcileClick(record),
              }] : []),
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BuildingLibraryIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Banka Hareketleri</h1>
              <p className="text-sm text-slate-500">Banka hesap hareketlerini yönetin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={() => refetch()}
                loading={isLoading}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Yenile
              </Button>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreate}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Hareket Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam İşlem</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ArrowDownIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.deposits)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yatırma</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ArrowUpIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.withdrawals)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Çekme</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.unreconciled}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen Mutabakat</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Banka hareketleri yüklenemedi</h3>
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Hareket ara... (referans no, açıklama)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={bankAccountId || undefined}
            onChange={(value) => setBankAccountId(value || undefined)}
            options={[
              { value: '', label: 'Tüm Hesaplar' },
              ...bankAccounts.map((acc) => ({ value: acc.id, label: acc.accountName })),
            ]}
            placeholder="Banka Hesabı"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={transactionType || undefined}
            onChange={(value) => setTransactionType(value || undefined)}
            options={transactionTypeOptions}
            placeholder="İşlem Türü"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={isReconciled === undefined ? undefined : String(isReconciled)}
            onChange={(value) => setIsReconciled(value === '' ? undefined : value === 'true')}
            options={reconciledOptions}
            placeholder="Mutabakat"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
        </div>
        <div className="mt-4">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="DD.MM.YYYY"
            placeholder={['Başlangıç', 'Bitiş']}
            size="large"
            className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} hareket`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              className: 'cursor-pointer',
            })}
            className={tableClassName}
          />
        )}
      </div>
    </div>
  );
}
