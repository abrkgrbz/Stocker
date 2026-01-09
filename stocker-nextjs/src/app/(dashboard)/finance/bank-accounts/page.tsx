'use client';

/**
 * Bank Accounts (Banka Hesaplari) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useBankAccounts, useDeleteBankAccount } from '@/lib/api/hooks/useFinance';
import type { BankAccountSummaryDto, BankAccountFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome account type configuration
const accountTypeConfig: Record<string, { bg: string; text: string; label: string }> = {
  Checking: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Vadesiz' },
  Savings: { bg: 'bg-slate-400', text: 'text-white', label: 'Vadeli' },
  Credit: { bg: 'bg-slate-600', text: 'text-white', label: 'Kredi' },
  Investment: { bg: 'bg-slate-900', text: 'text-white', label: 'Yatirim' },
};

export default function BankAccountsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [accountType, setAccountType] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: BankAccountFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    accountType: accountType as any,
  };

  // Fetch bank accounts from API
  const { data, isLoading, error, refetch } = useBankAccounts(filters);
  const deleteBankAccount = useDeleteBankAccount();

  const bankAccounts = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const totalBalance = bankAccounts.reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const tryBalance = bankAccounts.filter(ba => ba.currency === 'TRY').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const usdBalance = bankAccounts.filter(ba => ba.currency === 'USD').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const eurBalance = bankAccounts.filter(ba => ba.currency === 'EUR').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (accountId: number) => {
    try {
      await deleteBankAccount.mutateAsync(accountId);
      showSuccess('Banka hesabi basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Banka hesabi silinirken bir hata olustu');
      throw err;
    }
  };

  const handleDeleteClick = (account: BankAccountSummaryDto) => {
    Modal.confirm({
      title: 'Banka Hesabini Sil',
      content: `${account.accountName || 'Bu banka hesabi'} silinecek. Bu islem geri alinamaz.`,
      okText: 'Sil',
      cancelText: 'Iptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(account.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/bank-accounts/new');
  };

  const handleEdit = (account: BankAccountSummaryDto) => {
    router.push(`/finance/bank-accounts/${account.id}/edit`);
  };

  const handleView = (accountId: number) => {
    router.push(`/finance/bank-accounts/${accountId}`);
  };

  const accountTypeOptions = [
    { value: '', label: 'Tum Turler' },
    { value: 'Checking', label: 'Vadesiz' },
    { value: 'Savings', label: 'Vadeli' },
    { value: 'Credit', label: 'Kredi' },
    { value: 'Investment', label: 'Yatirim' },
  ];

  const columns: ColumnsType<BankAccountSummaryDto> = [
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BuildingLibraryIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{text || record.bankName}</div>
            <div className="text-xs text-slate-500">{record.accountNumber || record.iban || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Banka',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type) => {
        const config = accountTypeConfig[type] || { bg: 'bg-slate-100', text: 'text-slate-600', label: type };
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Bakiye',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      align: 'right',
      render: (balance, record) => (
        <div className="text-right">
          <div className={`text-sm font-semibold ${balance >= 0 ? 'text-slate-900' : 'text-slate-700'}`}>
            {formatCurrency(balance || 0, record.currency || 'TRY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
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
                label: 'Goruntule',
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Duzenle',
                onClick: () => handleEdit(record),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDeleteClick(record),
              },
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
              <h1 className="text-2xl font-bold text-slate-900">Banka Hesaplari</h1>
              <p className="text-sm text-slate-500">Sirket banka hesaplarinizi yonetin</p>
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
                Hesap Ekle
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
              <BuildingLibraryIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Hesap</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(tryBalance, 'TRY')}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">TRY Bakiye</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(usdBalance, 'USD')}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">USD Bakiye</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(eurBalance, 'EUR')}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">EUR Bakiye</div>
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
              <h3 className="text-sm font-medium text-slate-900">Banka hesaplari yuklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Banka hesaplari getirilirken bir hata olustu. Lutfen tekrar deneyin.'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Banka hesabi ara... (hesap adi, banka, IBAN)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={accountType || undefined}
            onChange={(value) => setAccountType(value || undefined)}
            options={accountTypeOptions}
            placeholder="Hesap Turu"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
            dataSource={bankAccounts}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} banka hesabi`,
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
